import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Category, SubCategory } from "../types";
import { convertEmulatorUrl, db } from "@/firebaseConfig";
import { logger } from "../utils/logger";

const CATEGORIES_COLLECTION = "CATEGORIES";
const SUBCATEGORIES_COLLECTION = "SUB_CATEGORIES";

// Helper function to convert Firestore data to Category
const firestoreToCategory = (id: string, data: any): Category => {
  return {
    id,
    name: data.name || "",
    nameLowerCase: data.nameLowerCase || "",
    searchArr: data.searchArr || [],
    description: data.description || "",
    type: data.type || "simple",
    displayOrder: data.displayOrder || 1,
    image: convertEmulatorUrl(data.image) || undefined,
    subCategoryCount: data.subCategoryCount || 0,
    isActive: data.isActive ?? true,
    productsCount: data.productsCount || 0,
    showOnHomepage: data.showOnHomepage ?? false,
    showOnNavbar: data.showOnNavbar ?? false,
    manufacturerIds: data.manufacturerIds || [],
    discountId: data.discountId || null,
  };
};

// Helper function to convert Firestore data to SubCategory
const firestoreToSubCategory = (id: string, data: any): SubCategory => {
  return {
    id,
    name: data.name || "",
    nameLowerCase: data.nameLowerCase || "",
    searchArr: data.searchArr || [],
    description: data.description || "",
    displayOrder: data.displayOrder || 1,
    image: convertEmulatorUrl(data.image) || undefined,
    parentCategoryId: data.parentCategoryId || "",
    isActive: data.isActive ?? true,
    productsCount: data.productsCount || 0,
    discountId: data.discountId || null,
    showOnNavbar: data.showOnNavbar ?? false,
  };
};

export const categoryService = {
  // Get all categories based on filters
  async getCategories(filters?: {
    isActive?: boolean;
    showOnHomepage?: boolean;
    showOnNavbar?: boolean;
    type?: "simple" | "special";
    productsCountGreaterThanZero?: boolean;
  }): Promise<Category[]> {
    try {
      let constraints = [];

      if (filters?.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }
      if (filters?.showOnHomepage !== undefined) {
        constraints.push(where("showOnHomepage", "==", filters.showOnHomepage));
      }
      if (filters?.showOnNavbar !== undefined) {
        constraints.push(where("showOnNavbar", "==", filters.showOnNavbar));
      }
      if (filters?.type !== undefined) {
        constraints.push(where("type", "==", filters.type));
      }
      if (filters?.productsCountGreaterThanZero) {
        constraints.push(where("productsCount", ">", 0));
      }

      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      const q = query(
        categoriesRef,
        ...constraints,
        orderBy("displayOrder", "asc")
      );
      const snapshot = await getDocs(q);

      const categories = snapshot.docs.map((doc) =>
        firestoreToCategory(doc.id, doc.data())
      );
      return categories;
    } catch (error) {
      logger.error("getCategories", error);
      throw error;
    }
  },

  // Get subcategory by ID
  async getSubCategories(
    parentCategoryId: string,
    filter?: { isActive?: boolean; showOnNavbar?: boolean }
  ): Promise<SubCategory[]> {
    try {
      const subCategoriesRef = collection(db, SUBCATEGORIES_COLLECTION);
      const constraints = [];

      if (filter?.isActive !== undefined) {
        constraints.push(where("isActive", "==", filter.isActive));
      }
      if (filter?.showOnNavbar !== undefined) {
        constraints.push(where("showOnNavbar", "==", filter.showOnNavbar));
      }

      const q = query(
        subCategoriesRef,
        where("parentCategoryId", "==", parentCategoryId),
        ...constraints,
        orderBy("displayOrder", "asc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) =>
        firestoreToSubCategory(doc.id, doc.data())
      );
    } catch (error) {
      logger.error("getSubCategories", error);
      throw error;
    }
  },
};
