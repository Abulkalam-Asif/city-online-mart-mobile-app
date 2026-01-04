export interface SubCategory {
  id: string;
  name: string;
  nameLowerCase: string;
  searchArr: string[];
  description?: string;
  displayOrder: number;
  image?: string;
  isActive: boolean;

  parentCategoryId: string; // Reference to parent category

  productsCount?: number;

  showOnNavbar: boolean;
  discountId?: string;
}