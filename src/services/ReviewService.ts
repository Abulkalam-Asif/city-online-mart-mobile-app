import {
  arrayUnion,
  average,
  collection,
  count,
  doc,
  getAggregateFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Review, REVIEW_TEXT_MAX_LENGTH } from "../types/review.types";
import { PaginatedResult } from "../types/common.types";
import { logger } from "../utils/logger";

export interface SaveReviewInput {
  productId: string;
  customerId: string;
  customerName: string;
  orderId: string;
  rating: number;
  text?: string;
}

export interface RatingSummary {
  average: number; // 0 when there are no reviews
  count: number;
}

/**
 * Customer reviews, stored at PRODUCTS/{productId}/REVIEWS/{customerId}.
 * The document id is the customer's UID, so a customer has one review per product and
 * saving again edits it. The rules (firestore.rules) re-check everything written here.
 */
export class ReviewService {
  private static readonly PRODUCTS_COLLECTION = "PRODUCTS";
  private static readonly REVIEWS_COLLECTION = "REVIEWS";
  private static readonly USERS_COLLECTION = "USERS";

  constructor(private db: FirebaseFirestoreTypes.Module) { }

  private reviewsRef(productId: string) {
    return collection(
      this.db,
      ReviewService.PRODUCTS_COLLECTION,
      productId,
      ReviewService.REVIEWS_COLLECTION,
    );
  }

  private reviewRef(productId: string, customerId: string) {
    return doc(this.reviewsRef(productId), customerId);
  }

  /**
   * Creates the customer's review of a product, or edits it when one exists (createdAt is kept).
   */
  async saveReview(input: SaveReviewInput): Promise<void> {
    const rating = input.rating;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be a whole number from 1 to 5.");
    }
    const text = input.text?.trim() ?? "";
    if (text.length > REVIEW_TEXT_MAX_LENGTH) {
      throw new Error(`Review text can be at most ${REVIEW_TEXT_MAX_LENGTH} characters.`);
    }

    try {
      const ref = this.reviewRef(input.productId, input.customerId);
      // The rules want the original createdAt on an edit and the server time on a new review.
      const existing = await getDoc(ref);
      const createdAt = existing.exists()
        ? (existing.data() as Review).createdAt
        : serverTimestamp();

      await setDoc(ref, {
        productId: input.productId,
        customerId: input.customerId,
        // the rules refuse an empty name, and a customer may not have set one
        customerName: input.customerName.trim() || "Customer",
        orderId: input.orderId,
        rating,
        // text is optional: leave the field out when empty (the rules allow a missing field)
        ...(text ? { text } : {}),
        createdAt,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      logger.error("Error saving review", error);
      throw error;
    }
  }

  /**
   * Ids of the products the customer has reviewed, kept on their USERS document so the Orders
   * list can tell which delivered orders still invite a review without reading any review.
   * It is a shortcut, not the source of truth: the reviews are.
   */
  async getReviewedProductIds(customerId: string): Promise<string[]> {
    try {
      const snapshot = await getDoc(doc(this.db, ReviewService.USERS_COLLECTION, customerId));
      return (snapshot.data()?.reviewedProductIds as string[] | undefined) ?? [];
    } catch (error) {
      logger.error("Error fetching reviewed product ids", error);
      throw error;
    }
  }

  async markProductsReviewed(customerId: string, productIds: string[]): Promise<void> {
    if (productIds.length === 0) return;
    try {
      await setDoc(
        doc(this.db, ReviewService.USERS_COLLECTION, customerId),
        { reviewedProductIds: arrayUnion(...productIds) },
        { merge: true },
      );
    } catch (error) {
      logger.error("Error marking products as reviewed", error);
      throw error;
    }
  }

  /**
   * The customer's own reviews for several products (to prefill the rating screen).
   * Keyed by product id; products without a review are missing from the map.
   */
  async getCustomerReviews(
    productIds: string[],
    customerId: string,
  ): Promise<Record<string, Review>> {
    try {
      const snapshots = await Promise.all(
        productIds.map((productId) => getDoc(this.reviewRef(productId, customerId))),
      );
      const reviews: Record<string, Review> = {};
      snapshots.forEach((snap, index) => {
        if (snap.exists()) reviews[productIds[index]] = snap.data() as Review;
      });
      return reviews;
    } catch (error) {
      logger.error("Error fetching customer reviews", error);
      throw error;
    }
  }

  /**
   * One page of a product's reviews, newest first. The cursor is the id of the last review
   * of the previous page (same shape as the paginated orders).
   */
  async getProductReviews(
    productId: string,
    pageSize: number,
    startAfterId?: string,
  ): Promise<PaginatedResult<Review>> {
    try {
      const constraints: any[] = [orderBy("createdAt", "desc")];

      if (startAfterId) {
        const lastDoc = await getDoc(this.reviewRef(productId, startAfterId));
        if (lastDoc.exists()) constraints.push(startAfter(lastDoc));
      }

      // One extra document tells us whether another page exists.
      constraints.push(limit(pageSize + 1));

      const snapshot = await getDocs(query(this.reviewsRef(productId), ...constraints));
      const hasMore = snapshot.docs.length > pageSize;
      const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

      return {
        items: docs.map((d: FirebaseFirestoreTypes.DocumentData) => d.data() as Review),
        hasMore,
        lastDocId: docs.length > 0 ? docs[docs.length - 1].id : undefined,
      };
    } catch (error) {
      logger.error("Error fetching product reviews", error);
      throw error;
    }
  }

  /**
   * Average rating and number of reviews, computed by Firestore (no documents are downloaded).
   */
  async getRatingSummary(productId: string): Promise<RatingSummary> {
    try {
      const snapshot = await getAggregateFromServer(this.reviewsRef(productId), {
        average: average("rating"),
        count: count(),
      });
      // the library's types do not know that average is null for an empty set
      const data = snapshot.data() as { average: number | null; count: number };
      return { average: data.average ?? 0, count: data.count };
    } catch (error) {
      logger.error("Error fetching rating summary", error);
      throw error;
    }
  }
}
