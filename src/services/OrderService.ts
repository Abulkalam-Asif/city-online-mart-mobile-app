import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  addDoc,
  Timestamp,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  ref,
  getDownloadURL,
  FirebaseStorageTypes,
} from "@react-native-firebase/storage";
import { Order, OrderItem, OrderLog, OrderStatus, PaymentStatus } from "../types/order.types";
import { Product } from "../types/product.types";
import { Discount } from "../types/discount.types";
import { OrderSettings } from "../types/settings.types";
import { sanitizeForFirestore } from "../utils/firestoreUtils";
import { logger } from "../utils/logger";
import type { DiscountService } from "./DiscountService";

export class OrderService {
  private static readonly ORDERS_COLLECTION = "ORDERS";
  private static readonly PRODUCTS_COLLECTION = "PRODUCTS";
  private static readonly SETTINGS_COLLECTION = "SETTINGS";
  private static readonly NOTIFICATIONS_COLLECTION = "NOTIFICATIONS";

  private _discountService!: DiscountService;

  constructor(
    private db: FirebaseFirestoreTypes.Module,
    private storage: FirebaseStorageTypes.Module
  ) { }

  set discountService(discountService: DiscountService) {
    this._discountService = discountService;
  }

  get discountService() {
    return this._discountService;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generates a unique 7-character alphanumeric ID (A-Z, 0-9).
   * Matches the admin-side pattern per Business Rule 4.0.
   */
  private generateShortId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generates a unique order ID, retrying up to 5 times on collision.
   */
  private async createUniqueOrderId(): Promise<string> {
    let id = this.generateShortId();
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 5) {
      const docRef = doc(this.db, OrderService.ORDERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        exists = false;
      } else {
        id = this.generateShortId();
        attempts++;
      }
    }
    return id;
  }

  /**
   * Creates a structured audit log entry.
   */
  private createLog(
    action: string,
    status: OrderStatus | PaymentStatus,
    actor: "user" | "admin" | "system",
    comment?: string
  ): OrderLog {
    const log: OrderLog = {
      action,
      status,
      actor,
      timestamp: Timestamp.now(),
    };
    if (comment) log.comment = comment;
    return log;
  }

  private async uploadPaymentProof(orderId: string, imageUri: string): Promise<string> {
    try {
      // For React Native Firebase, putFile is the native-optimized way to upload local URIs.
      // Fetching as a blob and using uploadBytes is often not implemented or inefficient.
      const storageRef = ref(this.storage, `ORDERS/${orderId}/payment-proof/${Date.now()}.jpg`);

      // We use the namespaced-style putFile on the reference if available, 
      // or the modular wrapper if it exists (RNFB compatibility).
      const uploadTask = (storageRef as any).putFile(imageUri);
      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      logger.error("uploading payment proof", error);
      throw new Error("Failed to upload payment proof image");
    }
  }

  /**
   * Triggers an admin notification for a new order.
   * Non-blocking — errors are caught and logged without failing the order.
   */
  private async triggerNotification(
    orderId: string,
    type: string,
    targetId: string,
    role: "admin" | "user"
  ) {
    try {
      const notificationsRef = collection(this.db, OrderService.NOTIFICATIONS_COLLECTION);
      await addDoc(notificationsRef, {
        orderId,
        type,
        targetId,
        role,
        isRead: false,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error("Error triggering notification", error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculates order pricing server-side using current product prices and valid discounts.
   *
   * Tiered Logic (per Business Rules):
   * 1. Product-level discounts applied first (highest % per item).
   * 2. Order-level discount applied on the running subtotal (highest qualifying %).
   *
   * @param items - Array of {productId, quantity} from the client
   * @returns Calculated pricing breakdown
   */
  async calculateOrderPricing(
    items: { productId: string; quantity: number }[]
  ): Promise<{
    items: OrderItem[];
    subtotal: number;
    discount: number;
    appliedOrderDiscount?: Order["appliedOrderDiscount"];
  }> {
    const orderItems: OrderItem[] = [];
    let runningSubtotal = 0;
    let itemDiscountsTotal = 0;

    // Fetch all products (N reads — unavoidable for server-side validation)
    for (const itemData of items) {
      const productRef = doc(this.db, OrderService.PRODUCTS_COLLECTION, itemData.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error(`Product ${itemData.productId} not found or is no longer available.`);
      }

      const product = productSnap.data() as Product;
      const unitPrice = product.price;

      // Find highest valid product-level discount
      let highestPercentage = 0;
      let bestProductDiscount: Product["validApplicableDiscounts"][0] | null = null;

      if (product.validApplicableDiscounts && product.validApplicableDiscounts.length > 0) {
        bestProductDiscount = product.validApplicableDiscounts.reduce((prev, current) =>
          current.percentage > prev.percentage ? current : prev
        );
        highestPercentage = bestProductDiscount.percentage;
      }

      const amountPerUnit = Math.round((unitPrice * highestPercentage) / 100);
      const totalItemDiscount = amountPerUnit * itemData.quantity;
      const itemSubtotal = (unitPrice * itemData.quantity) - totalItemDiscount;

      orderItems.push({
        productId: itemData.productId,
        productName: product.info.name,
        quantity: itemData.quantity,
        unitPrice,
        discount: totalItemDiscount,
        appliedDiscount: bestProductDiscount
          ? {
            id: bestProductDiscount.id,
            percentage: bestProductDiscount.percentage,
            amountPerUnit,
            totalAmount: totalItemDiscount,
            source: bestProductDiscount.source,
          }
          : undefined,
        subtotal: itemSubtotal,
      });

      runningSubtotal += itemSubtotal;
      itemDiscountsTotal += totalItemDiscount;
    }

    // Fetch valid order-level discounts (1 query)
    const orderDiscounts = await this._discountService.getValidOrderDiscounts();
    let bestOrderDiscount: Discount | null = null;

    for (const d of orderDiscounts) {
      if (runningSubtotal >= (d.minPurchaseAmount || 0)) {
        if (!bestOrderDiscount || d.percentage > bestOrderDiscount.percentage) {
          bestOrderDiscount = d;
        }
      }
    }

    let orderDiscountAmount = 0;
    let appliedOrderDiscount: Order["appliedOrderDiscount"] = undefined;

    if (bestOrderDiscount) {
      orderDiscountAmount = Math.round((runningSubtotal * bestOrderDiscount.percentage) / 100);
      appliedOrderDiscount = {
        id: bestOrderDiscount.id,
        name: bestOrderDiscount.name,
        percentage: bestOrderDiscount.percentage,
        amount: orderDiscountAmount,
      };
    }

    return {
      items: orderItems,
      subtotal: runningSubtotal,
      discount: itemDiscountsTotal + orderDiscountAmount,
      appliedOrderDiscount,
    };
  }

  /**
   * Creates a new order.
   *
   * Security: All pricing is recalculated server-side. Client-side totals are ignored.
   * Validation: Minimum order amount is enforced.
   *
   * @param orderData - Order data from the client (items as {productId, quantity} pairs)
   */
  async createOrder(
    orderData: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      source: "mobile" | "admin";
      items: { productId: string; quantity: number }[];
      paymentMethod: Order["paymentMethod"];
      deliveryAddress: string;
      proofOfPaymentUri?: string; // Accept local URI instead of final URL
    }
  ): Promise<string> {
    try {
      // 1. Fetch Order Settings (1 read)
      const settingsRef = doc(this.db, OrderService.SETTINGS_COLLECTION, "order");
      const settingsSnap = await getDoc(settingsRef);
      const orderSettings: OrderSettings = settingsSnap.exists()
        ? (settingsSnap.data() as OrderSettings)
        : { deliveryFee: 0, cancellationTimeLimitMinutes: 30, minimumOrderAmount: 0 };

      // 2. Recalculate pricing server-side (N product reads + 1 discount query)
      const pricing = await this.calculateOrderPricing(orderData.items);

      // 3. Validate minimum order amount
      const finalOrderAmount = pricing.subtotal - (pricing.appliedOrderDiscount?.amount || 0);
      if (finalOrderAmount < orderSettings.minimumOrderAmount) {
        throw new Error(
          `Order amount (Rs. ${finalOrderAmount}) is less than the minimum required (Rs. ${orderSettings.minimumOrderAmount}).`
        );
      }

      // 4. Generate unique 7-char alphanumeric ID
      const orderId = await this.createUniqueOrderId();

      // 5. Handle Payment Proof Upload if provided (NOW INTERNAL)
      let proofOfPaymentUrl = undefined;
      if (orderData.proofOfPaymentUri) {
        proofOfPaymentUrl = await this.uploadPaymentProof(orderId, orderData.proofOfPaymentUri);
      }

      // 6. Build the complete order object
      const newOrder: Order = {
        id: orderId,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        source: orderData.source,
        items: pricing.items,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        appliedOrderDiscount: pricing.appliedOrderDiscount,
        deliveryFee: orderSettings.deliveryFee,
        total: finalOrderAmount + orderSettings.deliveryFee,
        paymentMethod: orderData.paymentMethod,
        paymentStatus:
          orderData.paymentMethod.type === "cash_on_delivery"
            ? "pending"
            : "awaiting_confirmation",
        proofOfPaymentUrl, // Use the uploaded URL
        deliveryAddress: orderData.deliveryAddress,
        status: "pending",
        logs: [
          this.createLog("Order Created", "pending", "system"),
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // 6. Write to Firestore atomically
      await runTransaction(this.db, async (transaction) => {
        const orderRef = doc(this.db, OrderService.ORDERS_COLLECTION, orderId);
        // Verify ID uniqueness inside the transaction (race condition guard)
        const existing = await transaction.get(orderRef);
        if (existing.exists()) {
          throw new Error(`Order ID ${orderId} already exists. Please try again.`);
        }
        transaction.set(orderRef, sanitizeForFirestore(newOrder));
      });

      // 7. Notify admin (non-blocking)
      await this.triggerNotification(orderId, "new_order", "all_admins", "admin");

      return orderId;
    } catch (error) {
      logger.error("Error creating order", error);
      throw error;
    }
  }

  /**
   * Fetches a single order by ID.
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const docRef = doc(this.db, OrderService.ORDERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
      }
      return null;
    } catch (error) {
      logger.error("Error fetching order by ID", error);
      throw error;
    }
  }

  /**
   * Fetches all orders for a specific customer, ordered by most recent first.
   */
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(this.db, OrderService.ORDERS_COLLECTION);
      const q = query(
        ordersRef,
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (d: FirebaseFirestoreTypes.DocumentData) => ({ id: d.id, ...d.data() } as Order)
      );
    } catch (error) {
      logger.error("Error fetching customer orders", error);
      throw error;
    }
  }

  /**
   * Cancels an order (Mobile-specific rules per Business Rule 6.1):
   * - Only COD orders
   * - Only pending status
   * - Only within the cancellation time limit
   */
  async cancelOrder(orderId: string, customerId: string): Promise<void> {
    try {
      // Fetch settings for time limit (1 read)
      const settingsRef = doc(this.db, OrderService.SETTINGS_COLLECTION, "order");
      const settingsSnap = await getDoc(settingsRef);
      const settings: OrderSettings = settingsSnap.exists()
        ? (settingsSnap.data() as OrderSettings)
        : { deliveryFee: 0, cancellationTimeLimitMinutes: 30, minimumOrderAmount: 0 };

      await runTransaction(this.db, async (transaction) => {
        const orderRef = doc(this.db, OrderService.ORDERS_COLLECTION, orderId);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists()) {
          throw new Error(`Order ${orderId} not found.`);
        }

        const order = orderDoc.data() as Order;

        // Business Rule 6.1 validations
        if (order.customerId !== customerId) {
          throw new Error("You are not authorized to cancel this order.");
        }
        if (order.status !== "pending") {
          throw new Error("Only pending orders can be cancelled.");
        }
        if (order.paymentMethod.type !== "cash_on_delivery") {
          throw new Error("Only Cash on Delivery orders can be cancelled by the customer.");
        }

        const createdAt = (order.createdAt as FirebaseFirestoreTypes.Timestamp).toDate();
        const minutesElapsed = (Date.now() - createdAt.getTime()) / 1000 / 60;
        if (minutesElapsed > settings.cancellationTimeLimitMinutes) {
          throw new Error(
            `Cancellation window has expired. Orders can only be cancelled within ${settings.cancellationTimeLimitMinutes} minutes of placement.`
          );
        }

        const newLog = this.createLog("Order Cancelled", "cancelled", "user");
        transaction.update(orderRef, {
          status: "cancelled",
          cancelledBy: "user",
          updatedAt: Timestamp.now(),
          logs: [...(order.logs || []), newLog],
        });
      });
    } catch (error) {
      logger.error("Error cancelling order", error);
      throw error;
    }
  }
}
