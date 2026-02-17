import { Discount } from "../types";
import { convertTimestamp } from "../utils/firestoreUtils";
import { logger } from "../utils/logger";
import { collection, FirebaseFirestoreTypes, getDocs, query, where } from "@react-native-firebase/firestore";

export class DiscountService {

  private static readonly COLLECTION_NAME = "DISCOUNTS";

  constructor(private db: FirebaseFirestoreTypes.Module) { }

  /**
   * Helper function to convert Firestore data to Discount
   * @param id - Document ID
   * @param data - Firestore document data
   * @returns Discount object
   */
  private static firestoreToDiscount(id: string, data: any): Discount {
    return {
      id,
      name: data.name || "",
      description: data.description || undefined,
      percentage: data.percentage || 0,
      isActive: data.isActive !== undefined ? data.isActive : true, // Default to true for existing discounts
      type: data.type,
      minPurchaseAmount: data.minPurchaseAmount || 0,
      startDate: convertTimestamp(data.startDate),
      endDate: convertTimestamp(data.endDate),
    };
  };

  /**
   * Validate if a discount is currently valid
   * @param discount - Discount object with isActive, startDate, endDate
   * @returns true if discount is active and within valid date range
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
   * Fetches all valid order-level discounts
   * @returns Array of valid order-level discounts
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
      const discounts = snapshot.docs.map((doc: FirebaseFirestoreTypes.DocumentData) =>
        DiscountService.firestoreToDiscount(doc.id, doc.data())
      );

      // Final filtering by date on the client/service side (Firestore doesn't support multiple range filters easily with isActive)
      return discounts.filter((d: Discount) => DiscountService.isDiscountValid(d));
    } catch (error) {
      logger.error("Error fetching valid order discounts:", error);
      throw error;
    }
  }

};
