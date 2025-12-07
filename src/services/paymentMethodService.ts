import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { PaymentMethod } from "../types";
import { db } from "@/firebaseConfig";

const PAYMENT_METHODS_COLLECTION = "PAYMENT_METHODS";

// Helper function to convert Firestore data to PaymentMethod
const firestoreToPaymentMethod = (id: string, data: any): PaymentMethod => {
  return {
    id,
    type: data.type || "cash_on_delivery",
    isActive: data.isActive ?? true,
    displayOrder: data.displayOrder || 1,
    createdAt: data.createdAt?.toDate() || new Date(),
    accountDetails: data.accountDetails,
  };
};

export const paymentMethodService = {
  // Get all active payment methods
  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const paymentMethodsRef = collection(db, PAYMENT_METHODS_COLLECTION);
      const q = query(
        paymentMethodsRef,
        where("isActive", "==", true),
        orderBy("displayOrder", "asc")
      );
      const snapshot = await getDocs(q);

      const paymentMethods = snapshot.docs.map((doc) =>
        firestoreToPaymentMethod(doc.id, doc.data())
      );
      return paymentMethods;
    } catch (error) {
      console.error("Error fetching active payment methods at [getActivePaymentMethods]:", error);
      throw error;
    }
  },

  // Get payment method by ID
  async getPaymentMethodById(paymentMethodId: string): Promise<PaymentMethod | null> {
    try {
      const paymentMethodRef = doc(db, PAYMENT_METHODS_COLLECTION, paymentMethodId);
      const paymentMethodSnap = await getDoc(paymentMethodRef);

      if (!paymentMethodSnap.exists()) return null;

      return firestoreToPaymentMethod(paymentMethodSnap.id, paymentMethodSnap.data());
    } catch (error) {
      console.error("Error fetching payment method by ID at [getPaymentMethodById]:", error);
      throw error;
    }
  },
};