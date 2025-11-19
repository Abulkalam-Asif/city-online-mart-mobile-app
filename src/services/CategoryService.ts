import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Category, SubCategory } from "../types";
import { convertEmulatorUrl, db } from "@/firebaseConfig";

const CATEGORIES_COLLECTION = "CATEGORIES";
const SUBCATEGORIES_COLLECTION = "SUB_CATEGORIES";

// Helper function to convert Firestore data to Category
const firestoreToCategory = (id: string, data: any): Category => {
  return {
    id,
    name: data.name || "",
    slug: data.slug || "",
    description: data.description || "",
    type: data.type || "simple",
    displayOrder: data.displayOrder || 1,
    image: convertEmulatorUrl(data.image) || undefined,
    subCategoryCount: data.subCategoryCount || 0,
    isActive: data.isActive ?? true,
    productIds: data.productIds || [],
    productCount: data.productCount || 0,
    showOnHomepage: data.showOnHomepage ?? false,
    showOnNavbar: data.showOnNavbar ?? false,
    discountIds: data.discountIds || [],
    manufacturerIds: data.manufacturerIds || [],
  };
};

// Helper function to convert Firestore data to SubCategory
const firestoreToSubCategory = (
  id: string,
  data: any,
  parentCategoryId: string
): SubCategory => {
  return {
    id,
    name: data.name || "",
    slug: data.slug || "",
    description: data.description || "",
    displayOrder: data.displayOrder || 1,
    image: convertEmulatorUrl(data.image) || undefined,
    parentCategoryId,
    isActive: data.isActive ?? true,
    productIds: data.productIds || [],
    productCount: data.productCount || 0,
    discountIds: data.discountIds || [],
  };
};

export const categoryService = {
  // Get all categories
  async getAllCategories(filters?: {
    isActive?: boolean;
    showOnHomepage?: boolean;
  }): Promise<Category[]> {
    try {
      let constraints = [];

      if (filters?.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }
      if (filters?.showOnHomepage !== undefined) {
        constraints.push(where("showOnHomepage", "==", filters.showOnHomepage));
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
      console.error("Error fetching categories at [getAllCategories]: ", error);
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
        firestoreToSubCategory(doc.id, doc.data(), parentId)
      );
    } catch (error) {
      console.error("Error fetching subCategories:", error);
      throw error;
    }
  },
};
