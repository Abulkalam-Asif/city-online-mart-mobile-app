import {
  collection,
  getDocs,
  query,
  where,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Discount } from "../types/discount.types";
import { convertTimestamp } from "../utils/firestoreUtils";
import { logger } from "../utils/logger";

export class DiscountService {
  private static readonly COLLECTION_NAME = "DISCOUNTS";

  constructor(private db: FirebaseFirestoreTypes.Module) { }

  /**
   * Converts raw Firestore data to a typed Discount object.
   */
  private static firestoreToDiscount(id: string, data: any): Discount {
    return {
      id,
      name: data.name || "",
      description: data.description || undefined,
      percentage: data.percentage || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      type: data.type,
      minPurchaseAmount: data.minPurchaseAmount || 0,
      startDate: convertTimestamp(data.startDate),
      endDate: convertTimestamp(data.endDate),
    };
  }

  /**
   * Validates if a discount is currently active and within its date range.
   */
  private static isDiscountValid(discount: {
    isActive: boolean;
    startDate: Date;
    endDate: Date;
  }): boolean {
    const now = new Date();
    return (
      discount.isActive &&
      now >= discount.startDate &&
      now <= discount.endDate
    );
  }

  /**
   * Fetches all valid order-level discounts.
   * Firestore query filters by type and isActive; date validation is done client-side.
   */
  async getValidOrderDiscounts(): Promise<Discount[]> {
    try {
      const discountsRef = collection(this.db, DiscountService.COLLECTION_NAME);
      const q = query(
        discountsRef,
        where("type", "==", "order"),
        where("isActive", "==", true)
      );
      const snapshot = await getDocs(q);
      const discounts = snapshot.docs.map((d: FirebaseFirestoreTypes.DocumentData) =>
        DiscountService.firestoreToDiscount(d.id, d.data())
      );

      // Final date-range filter (Firestore doesn't support multiple range filters easily)
      return discounts.filter((d: Discount) => DiscountService.isDiscountValid(d));
    } catch (error) {
      logger.error("Error fetching valid order discounts:", error);
      throw error;
    }
  }
}
