// Banner Types aligned with Firebase structure
export interface IBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;

  // Placement
  placement?:
    | "homepage_main"
    | "homepage_secondary"
    | "category_page"
    | "product_page";

  // Validity
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
