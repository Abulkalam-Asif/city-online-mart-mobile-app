import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  FirebaseFirestoreTypes,
  QueryConstraint,
} from "@react-native-firebase/firestore";
import { Product, ProductSortType } from "../types";
import { convertEmulatorUrl } from "@/firebaseConfig";
import { logger } from "../utils/logger";
import { PaginatedResult } from "../types/common.types";


export class ProductService {

  private static readonly PRODUCTS_COLLECTION = "PRODUCTS";

  constructor(private db: FirebaseFirestoreTypes.Module) { }

  /**
   * Helper function to convert Firestore data to Product
   */
  private static firestoreToProduct = (id: string, data: any): Product => {
    // Helper to convert date field (can be Timestamp, ISO string, or undefined)
    const convertDate = (dateField: any): Date | undefined => {
      if (!dateField) return undefined;
      if (typeof dateField.toDate === "function") {
        // Firestore Timestamp
        return dateField.toDate();
      }
      if (typeof dateField === "string") {
        // ISO string
        return new Date(dateField);
      }
      return undefined;
    };

    return {
      id,
      info: {
        name: data.info?.name || "",
        nameLowerCase: data.info?.nameLowerCase || "",
        searchArr: data.info?.searchArr || [],
        description: data.info?.description || "",
        subCategoryId: data.info?.subCategoryId || "",
        specialCategoryIds: data.info?.specialCategoryIds || [],
        manufacturerId: data.info?.manufacturerId || "",
        isActive: data.info?.isActive ?? true,
        productTags: data.info?.productTags || [],
        allowCustomerReviews: data.info?.allowCustomerReviews ?? true,
        markAsNew: data.info?.markAsNew ?? false,
        markAsNewStartDate: convertDate(data.info?.markAsNewStartDate),
        markAsNewEndDate: convertDate(data.info?.markAsNewEndDate),
      },
      price: data.price || 0,
      discountId: data.discountId || null,
      discountSources: data.discountSources || [],
      validApplicableDiscounts: data.validApplicableDiscounts || [],
      minimumStockQuantity: data.minimumStockQuantity || 0,
      multimedia: {
        images: (data.multimedia?.images || []).map((url: string) =>
          convertEmulatorUrl(url)
        ),
        video: convertEmulatorUrl(data.multimedia?.video || ""),
      },
      boughtTogetherProductIds: data.boughtTogetherProductIds || [],
      batchStock: data.batchStock || {
        usableStock: 0,
        expiredStock: 0,
        totalStock: 0,
        activeBatchCount: 0,
      },
    };
  }

  /**
   * @param subCategoryId Sub category id
   * @param sortBy Sort by price-asc, price-desc, default (default is ascending order by document ID)
   * @param pageSize Page size
   * @param startAfterDoc Start after document id
   * @returns Paginated result of products
   */
  async getPaginatedProductsBySubCategory(subCategoryId: string, sortBy: ProductSortType, pageSize: number, startAfterDoc?: string | undefined): Promise<PaginatedResult<Product>> {
    try {
      const queryConstraints: any[] = [
        where("info.subCategoryId", "==", subCategoryId),
        where("info.isActive", "==", true)
      ];

      if (sortBy === "price-asc") {
        queryConstraints.push(orderBy("price", "asc"));
      } else if (sortBy === "price-desc") {
        queryConstraints.push(orderBy("price", "desc"));
      }

      // If startAfterDoc is provided, add it to the query constraints
      if (startAfterDoc) {
        const lastDoc = await getDoc(doc(this.db, ProductService.PRODUCTS_COLLECTION, startAfterDoc));
        if (lastDoc.exists()) {
          queryConstraints.push(startAfter(lastDoc));
        }
      }

      // Add limit + 1 to check if there are more documents
      queryConstraints.push(limit(pageSize + 1));

      const q = query(
        collection(this.db, ProductService.PRODUCTS_COLLECTION),
        ...queryConstraints
      );

      const snapshot = await getDocs(q);

      // Check if there are more documents
      const hasMore = snapshot.docs.length > pageSize;

      // Get actual items (excluding the extra one used for hasMore check)
      const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

      const products =
        docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ProductService.firestoreToProduct(doc.id, doc.data()))

      // Get lastDocId for next page cursor
      const lastDocId = docs.length > 0 ? docs[docs.length - 1].id : undefined;

      return {
        items: products,
        hasMore,
        lastDocId,
      };
    } catch (error) {
      logger.error("getProductBySubCategory", error);
      throw error;
    }
  }

  /**
   * Get paginated products by special category
   * @param specialCategoryId Special category id
   * @param sortBy Sort by price-asc, price-desc, default (default is ascending order by document ID)
   * @param pageSize Page size
   * @param startAfterDoc Start after document id
   * @returns Paginated result of products
   */
  async getPaginatedProductsBySpecialCategory(specialCategoryId: string, sortBy: ProductSortType, pageSize: number, startAfterDoc?: string | undefined): Promise<PaginatedResult<Product>> {
    try {
      const queryConstraints: QueryConstraint[] = [
        where("info.specialCategoryIds", "array-contains", specialCategoryId) as QueryConstraint,
        where("info.isActive", "==", true) as QueryConstraint
      ];

      if (sortBy === "price-asc") {
        queryConstraints.push(orderBy("price", "asc") as QueryConstraint);
      } else if (sortBy === "price-desc") {
        queryConstraints.push(orderBy("price", "desc") as QueryConstraint);
      }

      // If startAfterDoc is provided, add it to the query constraints
      if (startAfterDoc) {
        const lastDoc = await getDoc(doc(this.db, ProductService.PRODUCTS_COLLECTION, startAfterDoc));
        if (lastDoc.exists()) {
          queryConstraints.push(startAfter(lastDoc) as QueryConstraint);
        }
      }

      // Add limit + 1 to check if there are more documents
      queryConstraints.push(limit(pageSize + 1) as QueryConstraint);

      const q = query(
        collection(this.db, ProductService.PRODUCTS_COLLECTION),
        ...queryConstraints
      );

      const snapshot = await getDocs(q);

      // Check if there are more documents
      const hasMore = snapshot.docs.length > pageSize;

      // Get actual items (excluding the extra one used for hasMore check)
      const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

      const products =
        docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ProductService.firestoreToProduct(doc.id, doc.data()))

      // Get lastDocId for next page cursor
      const lastDocId = docs.length > 0 ? docs[docs.length - 1].id : undefined;

      return {
        items: products,
        hasMore,
        lastDocId,
      };
    } catch (error) {
      logger.error("getPaginatedProductsBySpecialCategory", error);
      throw error;
    }
  }

  /**
   * Get products by special category
   * @param specialCategoryId Special category id
   * @returns Array of products
   */
  async getProductsBySpecialCategory(
    specialCategoryId: string,
    filters?: {
      limit?: number;
    }
  ): Promise<Product[]> {
    try {
      const queryConstraints: QueryConstraint[] = [
        where("info.specialCategoryIds", "array-contains", specialCategoryId) as QueryConstraint,
        where("info.isActive", "==", true) as QueryConstraint
      ];
      if (filters?.limit) {
        queryConstraints.push(limit(filters.limit) as QueryConstraint);
      }
      const q = query(
        collection(this.db, ProductService.PRODUCTS_COLLECTION),
        ...queryConstraints
      );
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ProductService.firestoreToProduct(doc.id, doc.data()));

      return products;
    } catch (error) {
      logger.error("getProductsBySpecialCategory", error);
      throw error;
    }
  }

  /**
 * Get product by ID
 * @param id Product ID
 * @returns Product object or null if not found
 */
  async getProductById(id: string): Promise<Product | null> {

    const docRef = doc(this.db, ProductService.PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return ProductService.firestoreToProduct(docSnap.id, docSnap.data());
  }
};
