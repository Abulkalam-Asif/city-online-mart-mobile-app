import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// A customer's review of one product. Stored at PRODUCTS/{productId}/REVIEWS/{customerId}:
// the document id is the customer's UID, so a customer has at most one review per product.
// Keep in sync with admin/src/types/review.types.ts.
export interface Review {
  productId: string;
  customerId: string;
  customerName: string;
  orderId: string; // the delivered order the review came from
  rating: number; // whole number, 1 to 5
  text?: string; // optional, max 300 characters
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export const REVIEW_TEXT_MAX_LENGTH = 300;
