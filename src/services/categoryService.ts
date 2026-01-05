import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
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
  // Get all categories
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

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
      const snapshot = await getDoc(categoryRef);
      if (!snapshot.exists()) {
        return null;
      }
      return firestoreToCategory(snapshot.id, snapshot.data());
    } catch (error) {
      logger.error("getCategoryById", error);
      throw error;
    }
  },

  async getSubCategoryById(id: string): Promise<SubCategory | null> {
    try {
      const subCategoryRef = doc(db, SUBCATEGORIES_COLLECTION, id);
      const snapshot = await getDoc(subCategoryRef);
      if (!snapshot.exists()) {
        return null;
      }
      return firestoreToSubCategory(snapshot.id, snapshot.data());
    } catch (error) {
      logger.error("getSubCategoryById", error);
      throw error;
    }
  },

  // Get all active categories with their subCategories populated
  async getAllCategoriesWithSubCategories(): Promise<any[]> {
    try {
      // First, get all main categories
      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      const q = query(
        categoriesRef,
        where("isActive", "==", true),
        orderBy("displayOrder", "asc")
      );
      const snapshot = await getDocs(q);

      const categories = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const category = firestoreToCategory(docSnap.id, docSnap.data());

          // Fetch subCategories for this category
          const subCategories = await this.getSubCategories(category.id, {
            isActive: true,
          });

          return {
            ...category,
            subCategories,
          };
        })
      );

      return categories;
    } catch (error) {
      console.error("Error fetching categories with subCategories:", error);
      throw error;
    }
  },

  // Get subcategory by ID
  async getSubCategories(
    parentId: string,
    filter?: { isActive?: boolean }
  ): Promise<SubCategory[]> {
    try {
      const subCategoriesRef = collection(
        db,
        CATEGORIES_COLLECTION,
        parentId,
        SUBCATEGORIES_COLLECTION
      );
      const constraints = [];

      if (filter?.isActive !== undefined) {
        constraints.push(where("isActive", "==", filter.isActive));
      }
      const q = query(
        subCategoriesRef,
        ...constraints,
        orderBy("displayOrder", "asc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) =>
        firestoreToSubCategory(doc.id, doc.data())
      );
    } catch (error) {
      console.error("Error fetching subCategories:", error);
      throw error;
    }
  },
};
