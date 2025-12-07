export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Price at time of order
  discount: number; // Discount applied to this item
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;

  // Items
  items: OrderItem[];

  // Pricing
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus:
    | "pending"
    | "awaiting_confirmation"
    | "confirmed"
    | "refunded"
    | "cancelled";
  paymentStatusHistory: Array<{
    status: string;
    updatedAt: Date;
  }>;
  proofOfPaymentUrl?: string; // For bank transfers

  // Delivery
  deliveryAddress: string;

  // Status
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  statusHistory: Array<{
    status: string;
    updatedAt: Date;
  }>;

  riderId?: string;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface PaymentMethod {
  id: string;
  type: "easypaisa" | "jazzcash" | "bank_transfer" | "cash_on_delivery";
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  accountDetails?: {
    accountNumber: string;
    accountTitle: string;
    bankName?: string;
  };
}
