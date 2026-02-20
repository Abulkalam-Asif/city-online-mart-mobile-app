export interface ICartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountedUnitPrice: number;
  imageUrl: string;
  appliedDiscountId?: string; // From ProductDiscount.id
  appliedDiscountSource?: string; // From ProductDiscount.source
}

export interface Cart {
  items: ICartItem[];
  itemsSubtotal: number; // Subtotal of all items after product discounts
  appliedOrderDiscount?: {
    id: string;
    name: string;
    percentage: number;
    amount: number; // Pre-calculated discount amount
  };
}
