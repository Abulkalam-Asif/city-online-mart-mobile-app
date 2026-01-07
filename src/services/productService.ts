import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Product } from "../types";
import { db, convertEmulatorUrl } from "@/firebaseConfig";
import { logger } from "../utils/logger";

const PRODUCTS_COLLECTION = "PRODUCTS";

// Helper function to convert Firestore data to Product
const firestoreToProduct = (id: string, data: any): Product => {
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
};

export const productService = {
  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return firestoreToProduct(docSnap.id, data);
  },

  async getProductsBySpecialCategory(
    specialCategoryId: string
  ): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("info.specialCategoryIds", "array-contains", specialCategoryId),
        where("info.isActive", "==", true)
      );
      const snapshot = await getDocs(q);
      const discounts = await Promise.all(
        snapshot.docs.map(async (doc) => firestoreToProduct(doc.id, doc.data()))
      );
      return discounts;
    } catch (error) {
      logger.error("getProductsBySpecialCategory", error);
      throw error;
    }
  },
};
