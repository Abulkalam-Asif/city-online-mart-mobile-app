// Category Types
export type CategoryType = "simple" | "special";

export interface Category {
  id: string;
  name: string;
  nameLowerCase: string;
  searchArr: string[];
  description?: string;
  type: CategoryType;
  displayOrder: number;
  image?: string;
  isActive: boolean;
  subCategoryCount: number;

  // For special categories (homepage only)
  showOnHomepage: boolean;
  productsCount?: number;

  showOnNavbar: boolean;
  discountId?: string;
  manufacturerIds: string[];
}
