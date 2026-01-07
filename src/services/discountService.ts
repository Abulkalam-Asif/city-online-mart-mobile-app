import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Discount } from "../types";
import { convertTimestamp } from "../utils/firestoreUtils";
import { logger } from "../utils/logger";

const DISCOUNTS_COLLECTION = "DISCOUNTS";

// Helper function to convert Firestore data to Discount
const firestoreToDiscount = (id: string, data: any): Discount => {
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

export const discountService = {
  async getDiscountById(discountId: string): Promise<Discount | null> {
    try {
      const discountRef = doc(db, DISCOUNTS_COLLECTION, discountId);
      const discountSnapshot = await getDoc(discountRef);
      if (!discountSnapshot.exists()) {
        return null;
      }
      return firestoreToDiscount(discountSnapshot.id, discountSnapshot.data());
    } catch (error) {
      logger.error("getDiscountById", error);
      throw error;
    }
  },
};
