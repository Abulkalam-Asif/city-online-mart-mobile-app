import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { PaymentMethod } from "./payment_method.types";

// Order Types
export type OrderStatus =
  | "pending" // When order is created (Mobile or Admin)
  | "confirmed" // When admin acknowledges the order
  | "shipped" // When batches are scanned and order is dispatched
  | "delivered" // When order is delivered to customer
  | "cancelled"; // When admin or user (within time limit) cancels

export type PaymentStatus =
  | "pending" // For COD, or before any online payment action
  | "awaiting_confirmation" // For online payments, waiting for admin to verify screenshot
  | "confirmed" // Payment verified by admin or COD delivered
  | "cancelled";

export interface OrderLog {
  action: string;
  status: OrderStatus | PaymentStatus;
  actor: "user" | "admin" | "system";
  timestamp: FirebaseFirestoreTypes.Timestamp;
  comment?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  source: "mobile" | "admin";

  // Items
  items: OrderItem[];

  // Pricing
  subtotal: number;
  discount: number; // Sum of all discounts (item-level + order-level)
  appliedOrderDiscount?: {
    id: string;
    name: string;
    percentage: number;
    amount: number;
  };
  deliveryFee: number;
  total: number;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  proofOfPaymentUrl?: string; // Screenshot for online payments

  // Delivery
  deliveryAddress: string;
  deliveryNotes?: string;

  // Status
  status: OrderStatus;

  // Audit Logs
  logs: OrderLog[];

  // Metadata
  riderId?: string;
  cancelledBy?: "user" | "admin";

  // Timestamps
  createdAt: FirebaseFirestoreTypes.Timestamp;
  confirmedAt?: FirebaseFirestoreTypes.Timestamp;
  shippedAt?: FirebaseFirestoreTypes.Timestamp;
  deliveredAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Total discount amount for this item (quantity * amountPerUnit)
  appliedDiscount?: {
    id: string;
    percentage: number;
    amountPerUnit: number;
    totalAmount: number;
    source: string;
  };
  subtotal: number;
  batchAssignments?: {
    docId: string; // Firestore document ID (used for DB operations)
    batchId: string; // Human-readable batch ID (for display)
    quantity: number;
  }[];
}
