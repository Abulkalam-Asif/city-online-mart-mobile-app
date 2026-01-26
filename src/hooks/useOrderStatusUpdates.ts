import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Order } from "../types";

export interface OrderStatusUpdate {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  order: Order;
  timestamp: Date;
}

export const useOrderStatusUpdates = (customerId: string) => {
  const [statusUpdates, setStatusUpdates] = useState<OrderStatusUpdate[]>([]);
  const lastSeenStatusesRef = useRef<Record<string, string>>({});
  const listenerActiveRef = useRef(false);

  // useEffect(() => {
  //   if (!customerId) {
  //     console.log("🔇 Order status listener: No customer ID provided");
  //     return;
  //   }

  //   // Prevent multiple listeners
  //   if (listenerActiveRef.current) {
  //     return;
  //   }

  //   listenerActiveRef.current = true;

  //   // Query for customer's orders
  //   const ordersQuery = query(
  //     collection(db, "ORDERS"),
  //     where("customerId", "==", customerId)
  //   );

  //   // Set up real-time listener
  //   const unsubscribe = onSnapshot(
  //     ordersQuery,
  //     async (snapshot) => {
  //       const updates: OrderStatusUpdate[] = [];

  //       for (const change of snapshot.docChanges()) {
  //         const orderId = change.doc.id;
  //         const orderData = change.doc.data();

  //         if (change.type === "modified") {
  //           const newStatus = orderData.status;
  //           const previousStatus = lastSeenStatusesRef.current[orderId];

  //           // Check if status actually changed
  //           if (previousStatus && previousStatus !== newStatus) {
  //             // Get full order data
  //             const orderDoc = await getDoc(doc(db, "ORDERS", orderId));
  //             const fullOrderData = orderDoc.data();

  //             if (fullOrderData) {
  //               const order: Order = {
  //                 id: orderId,
  //                 customerId: fullOrderData.customerId || "",
  //                 items: fullOrderData.items || [],
  //                 subtotal: fullOrderData.subtotal || 0,
  //                 discount: fullOrderData.discount || 0,
  //                 deliveryFee: fullOrderData.deliveryFee || 0,
  //                 total: fullOrderData.total || 0,
  //                 paymentMethod: fullOrderData.paymentMethod,
  //                 paymentStatus: fullOrderData.paymentStatus || "pending",
  //                 paymentStatusHistory:
  //                   fullOrderData.paymentStatusHistory || [],
  //                 proofOfPaymentUrl: fullOrderData.proofOfPaymentUrl,
  //                 deliveryAddress: fullOrderData.deliveryAddress || "",
  //                 status: fullOrderData.status || "pending",
  //                 statusHistory: fullOrderData.statusHistory || [],
  //                 riderId: fullOrderData.riderId,
  //                 createdAt: fullOrderData.createdAt?.toDate() || new Date(),
  //                 deliveredAt: fullOrderData.deliveredAt?.toDate(),
  //               };

  //               updates.push({
  //                 orderId,
  //                 previousStatus,
  //                 newStatus,
  //                 order,
  //                 timestamp: new Date(),
  //               });
  //             }
  //           }

  //           // Update last seen status
  //           lastSeenStatusesRef.current[orderId] = newStatus;
  //         } else if (change.type === "added") {
  //           // Initialize status for new orders
  //           const orderData = change.doc.data();
  //           lastSeenStatusesRef.current[orderId] =
  //             orderData.status || "pending";
  //         } else if (change.type === "removed") {
  //           // Clean up removed orders
  //           delete lastSeenStatusesRef.current[orderId];
  //         }
  //       }

  //       if (updates.length > 0) {
  //         setStatusUpdates(updates);
  //       }
  //     },
  //     (error) => {
  //       console.error("Order status listener error:", error);
  //     }
  //   );

  //   return () => {
  //     listenerActiveRef.current = false;
  //     unsubscribe();
  //   };
  // }, [customerId]); // Removed lastSeenStatuses from deps to prevent re-creation

  // Clear updates after they've been consumed
  
  const clearUpdates = () => {
    console.log("🧹 Clearing status updates");
    setStatusUpdates([]);
  };

  return {
    statusUpdates,
    clearUpdates,
  };
};
