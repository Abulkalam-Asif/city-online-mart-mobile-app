export interface ICartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountedUnitPrice: number;
  imageUrl: string;
}

export interface Cart {
  items: ICartItem[];
  total: number;
  appliedOrderDiscount?: {
    id: string;
    name: string;
    percentage: number;
    amount: number; // Pre-calculated discount amount
  };
}
