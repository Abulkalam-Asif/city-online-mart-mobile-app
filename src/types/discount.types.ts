export type DiscountType = "product" | "category" | "sub-category" | "order";

/** What an order-type discount gives. A missing value means "percentage" (discounts older than the field). */
export type DiscountBenefitType = "percentage" | "free_delivery";

export interface Discount {
  id: string;
  name: string;
  nameLowerCase?: string;
  description?: string;
  percentage: number; // 0 for a free delivery discount

  isActive: boolean; // Manually activate/deactivate the discount

  type: DiscountType;

  benefitType?: DiscountBenefitType; // Only used when type = 'order'

  minPurchaseAmount?: number; // Minimum order amount to qualify (Only used when type = 'order'; above 0 for free delivery)

  // Validity
  startDate: Date;
  endDate: Date;
}

export type DiscountSearchResult = Pick<Discount, "id" | "name" | "percentage">;