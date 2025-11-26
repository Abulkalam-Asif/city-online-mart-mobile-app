export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  batchId: string;
  addedAt: Date;
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  lastUpdated: Date;
}