import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  increment,
} from "firebase/firestore";
import { Order, OrderItem, PaymentMethod } from "../types";
import { db } from "@/firebaseConfig";
import { generateOrderId } from "../utils/orderIdGenerator";

const ORDERS_COLLECTION = "ORDERS";
const CUSTOMERS_COLLECTION = "CUSTOMERS";
const BATCHES_COLLECTION = "BATCHES";

// Helper function to convert Firestore data to Order
const firestoreToOrder = (id: string, data: any): Order => {
  return {
    id,
    customerId: data.customerId || "",
    items: data.items || [],
    subtotal: data.subtotal || 0,
    discount: data.discount || 0,
    deliveryFee: data.deliveryFee || 0,
    total: data.total || 0,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentStatus || "pending",
    paymentStatusHistory: data.paymentStatusHistory || [],
    proofOfPaymentUrl: data.proofOfPaymentUrl,
    deliveryAddress: data.deliveryAddress || "",
    status: data.status || "pending",
    statusHistory: data.statusHistory || [],
    riderId: data.riderId,
    createdAt: data.createdAt?.toDate() || new Date(),
    deliveredAt: data.deliveredAt?.toDate(),
  };
};

export const orderService = {
  // Place a new order
  async placeOrder(orderData: {
    customerId: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    paymentMethod: PaymentMethod;
    deliveryAddress: string;
    proofOfPaymentUrl?: string;
  }): Promise<string> {
    try {
      // Start batch write for atomicity
      const batch = writeBatch(db);

      // Generate custom order ID
      const orderId = generateOrderId();
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);

      // Filter out undefined values for Firestore
      const filteredOrderData = Object.fromEntries(
        Object.entries(orderData).filter(([_, value]) => value !== undefined)
      );

      // Set payment status based on payment method
      const paymentStatus = orderData.paymentMethod.type === "cash_on_delivery" ? "pending" : "awaiting_confirmation";

      const orderDoc = {
        ...filteredOrderData,
        id: orderId,
        status: "pending",
        paymentStatus,
        statusHistory: [
          {
            status: "pending",
            updatedAt: Timestamp.now(),
          },
        ],
        paymentStatusHistory: [
          {
            status: paymentStatus,
            updatedAt: Timestamp.now(),
          },
        ],
        createdAt: Timestamp.now(),
      };
      batch.set(orderRef, orderDoc);

      // Update customer stats (create customer if doesn't exist)
      const customerRef = doc(db, CUSTOMERS_COLLECTION, orderData.customerId);
      batch.set(customerRef, {
        id: orderData.customerId,
        name: "Test Customer", // Default name for testing
        phone: "+1234567890", // Default phone for testing
        address: orderData.deliveryAddress,
        totalOrders: increment(1),
        totalSpent: increment(orderData.total),
        notificationsEnabled: true,
        isActive: true,
      }, { merge: true }); // merge: true creates if doesn't exist, updates if exists

      // TODO: Reduce inventory for each item - commented out for testing
      // for (const item of orderData.items) {
      //   const batchRef = doc(db, BATCHES_COLLECTION, item.batchId);
      //   batch.update(batchRef, {
      //     remainingQuantity: increment(-item.quantity),
      //   });
      // }

      await batch.commit();
      console.log("Order placed successfully:", orderId);
      return orderId;
    } catch (error) {
      console.error("Error placing order at [placeOrder]:", error);
      throw error;
    }
  },

  // Get orders for a customer
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, ORDERS_COLLECTION);
      const q = query(
        ordersRef,
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      const orders = snapshot.docs.map((doc) =>
        firestoreToOrder(doc.id, doc.data())
      );
      return orders;
    } catch (error) {
      console.error("Error fetching customer orders at [getCustomerOrders]:", error);
      throw error;
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) return null;

      return firestoreToOrder(orderSnap.id, orderSnap.data());
    } catch (error) {
      console.error("Error fetching order by ID at [getOrderById]:", error);
      throw error;
    }
  },
};