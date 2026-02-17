import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "@react-native-firebase/firestore";
import { PaymentMethod } from "../types";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export class PaymentMethodService {
  constructor(private db: FirebaseFirestoreTypes.Module) { }

  private static readonly COLLECTION_NAME = "PAYMENT_METHODS";

  // Helper function to convert Firestore data to PaymentMethod
  private static firestoreToPaymentMethod = (
    id: string,
    data: any,
  ): PaymentMethod => {
    return {
      id,
      type: data.type || "cash_on_delivery",
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder || 1,
      createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
      accountDetails: data.accountDetails || undefined,
    };
  };

  /**
   * Get all active payment methods from Firestore
   * @returns Promise<PaymentMethod[]>
   */
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const methodsRef = collection(
        this.db,
        PaymentMethodService.COLLECTION_NAME,
      );
      const q = query(methodsRef, orderBy("displayOrder", "asc"), where("isActive", "==", true));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc: FirebaseFirestoreTypes.DocumentData) =>
        PaymentMethodService.firestoreToPaymentMethod(doc.id, doc.data()),
      );
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      throw error;
    }
  }
}
