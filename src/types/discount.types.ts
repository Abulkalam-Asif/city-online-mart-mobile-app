export type DiscountType = "product" | "category" | "sub-category" | "order";

export interface Discount {
  id: string;
  name: string;
  nameLowerCase?: string;
  description?: string;
  percentage: number;

  isActive: boolean; // Manually activate/deactivate the discount

  type: DiscountType;

  minPurchaseAmount?: number; // Minimum order amount to qualify (Only used when type = 'order')

  // Validity
  startDate: Date;
  endDate: Date;
}

export type DiscountSearchResult = Pick<Discount, "id" | "name" | "percentage">;