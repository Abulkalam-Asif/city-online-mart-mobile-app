import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { Product } from "../types";
import { db, convertEmulatorUrl } from "@/firebaseConfig";

const PRODUCTS_COLLECTION = "PRODUCTS";
const DISCOUNTS_COLLECTION = "DISCOUNTS";
const CATEGORIES_COLLECTION = "CATEGORIES";
const SUBCATEGORIES_COLLECTION = "SUB_CATEGORIES";

// Discount type
interface Discount {
  id: string;
  name: string;
  description?: string;
  value: number;
  applicableTo: "products" | "categories" | "order";
  minPurchaseAmount?: number;
  startDate: Date;
  endDate: Date;
  currentUsageCount: number;
}

// Helper: Parse categoryId to determine if it's a main category or subcategory
function parseCategoryId(categoryId: string): {
  categoryId: string;
  subCategoryId: string | null;
} {
  const parts = categoryId.split("/");
  if (parts.length === 2) {
    return { categoryId: parts[0], subCategoryId: parts[1] };
  }
  return { categoryId: parts[0], subCategoryId: null };
}

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
    slug: data.slug || "",
    info: {
      name: data.info?.name || "",
      description: data.info?.description || "",
      categoryIds: data.info?.categoryIds || [],
      manufacturerId: data.info?.manufacturerId || "",
      isActive: data.info?.isActive ?? true,
      productTags: data.info?.productTags || [],
      allowCustomerReviews: data.info?.allowCustomerReviews ?? true,
      markAsNew: data.info?.markAsNew ?? false,
      markAsNewStartDate: convertDate(data.info?.markAsNewStartDate),
      markAsNewEndDate: convertDate(data.info?.markAsNewEndDate),
    },
    price: data.price || 0,
    discountIds: data.discountIds || [],
    minimumStockQuantity: data.minimumStockQuantity || 0,
    multimedia: {
      images: (data.multimedia?.images || []).map((url: string) =>
        convertEmulatorUrl(url)
      ),
      video: convertEmulatorUrl(data.multimedia?.video || ""),
    },
    similarProductIds: data.similarProductIds || [],
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

  // Get products by category with pagination
  async getProductsByCategory(
    categoryId: string,
    pageLimit: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);

      // Build query
      let q = query(
        productsRef,
        where("info.categoryIds", "array-contains", categoryId),
        where("info.isActive", "==", true),
        orderBy("info.name", "asc"),
        limit(pageLimit)
      );

      // Add pagination cursor if provided
      if (lastDoc) {
        q = query(
          productsRef,
          where("info.categoryIds", "array-contains", categoryId),
          where("info.isActive", "==", true),
          orderBy("info.name", "asc"),
          startAfter(lastDoc),
          limit(pageLimit)
        );
      }

      const snapshot = await getDocs(q);

      const products = snapshot.docs.map((doc) =>
        firestoreToProduct(doc.id, doc.data())
      );

      // Fetch discount percentages for all products
      const productsWithDiscounts = await Promise.all(
        products.map(async (product) => {
          const discountPercentage =
            await this.getHighestActiveDiscountPercentageByProductId(
              product.id
            );
          return {
            ...product,
            discountPercentage,
          };
        })
      );

      // Get the last document for pagination
      const lastVisible =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      return {
        products: productsWithDiscounts,
        lastDoc: lastVisible,
      };
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  // Get products by subcategory with pagination
  async getProductsBySubCategory(
    parentCategoryId: string,
    subCategoryId: string,
    pageLimit: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const fullCategoryId = `${parentCategoryId}/${subCategoryId}`;

      // Build query
      let q = query(
        productsRef,
        where("info.categoryIds", "array-contains", fullCategoryId),
        where("info.isActive", "==", true),
        orderBy("info.name", "asc"),
        limit(pageLimit)
      );

      // Add pagination cursor if provided
      if (lastDoc) {
        q = query(
          productsRef,
          where("info.categoryIds", "array-contains", fullCategoryId),
          where("info.isActive", "==", true),
          orderBy("info.name", "asc"),
          startAfter(lastDoc),
          limit(pageLimit)
        );
      }

      const snapshot = await getDocs(q);

      const products = snapshot.docs.map((doc) =>
        firestoreToProduct(doc.id, doc.data())
      );

      // Fetch discount percentages for all products
      const productsWithDiscounts = await Promise.all(
        products.map(async (product) => {
          const discountPercentage =
            await this.getHighestActiveDiscountPercentageByProductId(
              product.id
            );
          return {
            ...product,
            discountPercentage,
          };
        })
      );

      // Get the last document for pagination
      const lastVisible =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      return {
        products: productsWithDiscounts,
        lastDoc: lastVisible,
      };
    } catch (error) {
      console.error("Error fetching products by subcategory:", error);
      throw error;
    }
  },

  // Get products by array of IDs with pagination (maintains order)
  async getProductsByIds(
    productIds: string[],
    pageLimit: number = 5,
    currentIndex: number = 0
  ): Promise<{ products: Product[]; nextIndex: number | null }> {
    try {
      if (productIds.length === 0) {
        return { products: [], nextIndex: null };
      }

      // Calculate the slice of IDs to fetch for this page
      const startIndex = currentIndex;
      const endIndex = Math.min(startIndex + pageLimit, productIds.length);
      const idsToFetch = productIds.slice(startIndex, endIndex);

      if (idsToFetch.length === 0) {
        return { products: [], nextIndex: null };
      }

      // Fetch products for this page
      const productPromises = idsToFetch.map((id) => this.getProductById(id));
      const fetchedProducts = await Promise.all(productPromises);

      // Filter out null values (products that don't exist)
      const validProducts = fetchedProducts.filter(
        (product): product is Product => product !== null
      );

      // Fetch discount percentages for all products
      const productsWithDiscounts = await Promise.all(
        validProducts.map(async (product) => {
          const discountPercentage =
            await this.getHighestActiveDiscountPercentageByProductId(
              product.id
            );
          return {
            ...product,
            discountPercentage,
          };
        })
      );

      // Determine next index for pagination
      const nextIndex = endIndex < productIds.length ? endIndex : null;

      return {
        products: productsWithDiscounts,
        nextIndex,
      };
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      throw error;
    }
  },

  // Helper: Get discount by ID
  async getDiscountById(id: string): Promise<Discount | null> {
    try {
      const docRef = doc(db, DISCOUNTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();

      // Convert date fields (can be Timestamp or ISO string)
      const convertDate = (dateField: any): Date => {
        if (!dateField) return new Date();
        if (typeof dateField.toDate === "function") {
          return dateField.toDate();
        }
        if (typeof dateField === "string") {
          return new Date(dateField);
        }
        return new Date();
      };

      return {
        id: docSnap.id,
        name: data.name || "",
        description: data.description,
        value: data.value || 0,
        applicableTo: data.applicableTo || "products",
        minPurchaseAmount: data.minPurchaseAmount,
        startDate: convertDate(data.startDate),
        endDate: convertDate(data.endDate),
        currentUsageCount: data.currentUsageCount || 0,
      };
    } catch (error) {
      console.error("Error fetching discount:", error);
      return null;
    }
  },

  // Helper: Check if discount is currently active
  isDiscountActive(discount: Discount): boolean {
    const now = new Date();
    return (
      new Date(discount.startDate) <= now && new Date(discount.endDate) >= now
    );
  },

  // Get discount IDs from a category (handles both main categories and subcategories)
  async getDiscountIdsOnCategoryById(categoryId: string): Promise<string[]> {
    try {
      const parsed = parseCategoryId(categoryId);
      let docRef;

      if (parsed.subCategoryId) {
        // Subcategory
        docRef = doc(
          db,
          CATEGORIES_COLLECTION,
          parsed.categoryId,
          SUBCATEGORIES_COLLECTION,
          parsed.subCategoryId
        );
      } else {
        // Main category
        docRef = doc(db, CATEGORIES_COLLECTION, parsed.categoryId);
      }

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const categoryData = docSnap.data();
        return categoryData.discountIds || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching discount IDs for category:", error);
      return [];
    }
  },

  // Get all discount IDs associated with a product (including category and subcategory discounts)
  async getAllDiscountIdsOnProductById(productId: string): Promise<string[]> {
    try {
      // Get product to access its discount IDs and category IDs
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const productDoc = await getDoc(doc(productsRef, productId));

      if (!productDoc.exists()) return [];

      const productData = productDoc.data();
      const allDiscountIds = [];

      // Add product-level discount IDs
      if (productData.discountIds) {
        allDiscountIds.push(...productData.discountIds);
      }

      // Add category-level discount IDs
      const categoryIds = productData.info?.categoryIds || [];
      await Promise.all(
        categoryIds.map(async (categoryId: string) => {
          const categoryDiscountIds = await this.getDiscountIdsOnCategoryById(
            categoryId
          );
          allDiscountIds.push(...categoryDiscountIds);
        })
      );

      // Remove duplicates
      const uniqueDiscountIds = Array.from(new Set(allDiscountIds));
      return uniqueDiscountIds;
    } catch (error) {
      console.error("Error fetching discounts for product:", error);
      return [];
    }
  },

  // Get highest active discount percentage applicable to a product
  async getHighestActiveDiscountPercentageByProductId(
    productId: string
  ): Promise<number> {
    try {
      const allDiscountIds = await this.getAllDiscountIdsOnProductById(
        productId
      );
      if (allDiscountIds.length === 0) return 0;

      const discountPromises = allDiscountIds.map((discountId) =>
        this.getDiscountById(discountId)
      );
      const discounts = await Promise.all(discountPromises);
      const validDiscounts = discounts.filter(
        (discount): discount is Discount => discount !== null
      );

      // Check if the discount is active and within date range
      const applicableDiscounts = validDiscounts.filter((discount) => {
        return this.isDiscountActive(discount);
      });

      if (applicableDiscounts.length === 0) return 0;

      const highestDiscount = applicableDiscounts.reduce(
        (max, discount) => (discount.value > max ? discount.value : max),
        0
      );

      return highestDiscount;
    } catch (error) {
      console.error("Error fetching highest discount for product:", error);
      return 0;
    }
  },

  // Is mark as new valid
  isMarkAsNewValid(
    markAsNewStartDate?: Date,
    markAsNewEndDate?: Date
  ): boolean {
    const now = new Date();
    if (!markAsNewStartDate || !markAsNewEndDate) return false;
    return now >= markAsNewStartDate && now <= markAsNewEndDate;
  },
};
