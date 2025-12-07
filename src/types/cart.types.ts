export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
