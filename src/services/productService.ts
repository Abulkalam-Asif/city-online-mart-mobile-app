import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Discount, Product, ProductWithDiscount } from "../types";
import { db, convertEmulatorUrl } from "@/firebaseConfig";
import { logger } from "../utils/logger";
import { discountService } from "./discountService";
import { categoryService } from "./categoryService";

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
  ): Promise<ProductWithDiscount[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("info.specialCategoryIds", "array-contains", specialCategoryId),
        where("info.isActive", "==", true),
      );
      const snapshot = await getDocs(q);
      const products: ProductWithDiscount[] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const product = firestoreToProduct(doc.id, doc.data());
          const discount = await this.getValidDiscountByProduct(product);
          return {
            ...product,
            discountPercentage: discount?.percentage || 0,
          };
        })
      );
      return products;
    } catch (error) {
      logger.error("getProductsBySpecialCategory", error);
      throw error;
    }
  },

  /**
   * Get the valid discount applicable to a product.
   *
   * Priority Order (first valid discount wins):
   * 1. Product-level discount (directly assigned to product)
   * 2. SubCategory-level discount (if product belongs to a subcategory)
   * 3. Parent Category-level discount (parent of the subcategory)
   * 4. Special Category discounts (if product has no subcategory, find highest among special categories)
   *
   * @param product - The product to check for discounts
   * @returns The highest priority valid discount, or null if none found
   */
  async getValidDiscountByProduct(
    product: Product
  ): Promise<Discount | null> {
    try {
      // Priority 1: Check product-level discount
      if (product.discountId) {
        const discount = await discountService.getDiscountById(
          product.discountId
        );
        if (discount && discountService.isDiscountValid(discount)) {
          return discount;
        }
      }

      // Priority 2 & 3: Check subcategory and its parent category
      if (product.info.subCategoryId) {
        const subCategory = await categoryService.getSubCategoryById(
          product.info.subCategoryId
        );

        // Priority 2: SubCategory-level discount
        if (subCategory?.discountId) {
          const discount = await discountService.getDiscountById(
            subCategory.discountId
          );
          if (discount && discountService.isDiscountValid(discount)) {
            return discount;
          }
        }

        // Priority 3: Parent Category-level discount
        if (subCategory?.parentCategoryId) {
          const category = await categoryService.getCategoryById(
            subCategory.parentCategoryId
          );
          if (category?.discountId) {
            const discount = await discountService.getDiscountById(
              category.discountId
            );
            if (discount && discountService.isDiscountValid(discount)) {
              return discount;
            }
          }
        }
      } else {
        // Priority 4: Special category discounts (only if no subcategory)
        // Find highest valid discount among all special categories
        const specialCategoryIds = product.info.specialCategoryIds;
        if (specialCategoryIds && specialCategoryIds.length > 0) {
          // Collect unique discount IDs from special categories
          const discountIds = new Set<string>();
          for (const categoryId of specialCategoryIds) {
            const category = await categoryService.getCategoryById(categoryId);
            if (category?.discountId) {
              discountIds.add(category.discountId);
            }
          }

          // Fetch all discounts in parallel and find the highest valid one
          const discounts = await Promise.all(
            Array.from(discountIds).map((id) =>
              discountService.getDiscountById(id)
            )
          );

          const validDiscounts = discounts.filter(
            (d): d is Discount => d !== null && discountService.isDiscountValid(d)
          );

          if (validDiscounts.length > 0) {
            // Return the discount with highest percentage
            return validDiscounts.reduce((highest, current) =>
              current.percentage > highest.percentage ? current : highest
            );
          }
        }
      }

      return null;
    } catch (error) {
      logger.error("getValidDiscountByProduct", error);
      throw error;
    }
  },
};
