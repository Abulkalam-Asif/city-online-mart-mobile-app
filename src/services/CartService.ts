import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  Timestamp,
} from "firebase/firestore";
import { Cart, CartItem } from "../types";
import { db } from "@/firebaseConfig";

const CARTS_COLLECTION = "CARTS";

// For now, using a hardcoded customer ID since auth is not implemented
const CURRENT_CUSTOMER_ID = "customer123";

// Helper function to convert Firestore data to Cart
const firestoreToCart = (id: string, data: any): Cart => {
  return {
    id,
    customerId: data.customerId || "",
    items: data.items || [],
    total: data.total || 0,
    itemCount: data.itemCount || 0,
    lastUpdated: data.lastUpdated?.toDate() || new Date(),
  };
};

// Helper function to calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

export const cartService = {
  // Get cart for current customer
  async getCart(): Promise<Cart | null> {
    try {
      const cartRef = doc(db, CARTS_COLLECTION, CURRENT_CUSTOMER_ID);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        // Return empty cart if none exists
        return {
          id: CURRENT_CUSTOMER_ID,
          customerId: CURRENT_CUSTOMER_ID,
          items: [],
          total: 0,
          itemCount: 0,
          lastUpdated: new Date(),
        };
      }

      return firestoreToCart(cartSnap.id, cartSnap.data());
    } catch (error) {
      console.error("Error fetching cart at [getCart]:", error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId: string, productName: string, unitPrice: number, quantity: number = 1, batchId: string): Promise<void> {
    try {
      const cartRef = doc(db, CARTS_COLLECTION, CURRENT_CUSTOMER_ID);
      const cartSnap = await getDoc(cartRef);

      let items: CartItem[] = [];

      if (cartSnap.exists()) {
        items = cartSnap.data()?.items || [];
      }

      // Check if item already exists
      const existingItemIndex = items.findIndex(item => item.productId === productId);

      if (existingItemIndex >= 0) {
        // Update quantity
        items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: CartItem = {
          productId,
          productName,
          quantity,
          unitPrice,
          batchId,
          addedAt: new Date(),
        };
        items.push(newItem);
      }

      const { total, itemCount } = calculateCartTotals(items);

      await setDoc(cartRef, {
        customerId: CURRENT_CUSTOMER_ID,
        items,
        total,
        itemCount,
        lastUpdated: Timestamp.now(),
      });

      console.log("Item added to cart successfully");
    } catch (error) {
      console.error("Error adding item to cart at [addToCart]:", error);
      throw error;
    }
  },

  // Update item quantity in cart
  async updateCartItem(productId: string, quantity: number): Promise<void> {
    try {
      const cartRef = doc(db, CARTS_COLLECTION, CURRENT_CUSTOMER_ID);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        throw new Error("Cart not found");
      }

      let items: CartItem[] = cartSnap.data()?.items || [];
      const itemIndex = items.findIndex(item => item.productId === productId);

      if (itemIndex === -1) {
        throw new Error("Item not found in cart");
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }

      const { total, itemCount } = calculateCartTotals(items);

      await updateDoc(cartRef, {
        items,
        total,
        itemCount,
        lastUpdated: Timestamp.now(),
      });

      console.log("Cart item updated successfully");
    } catch (error) {
      console.error("Error updating cart item at [updateCartItem]:", error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId: string): Promise<void> {
    try {
      const cartRef = doc(db, CARTS_COLLECTION, CURRENT_CUSTOMER_ID);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return; // Cart doesn't exist, nothing to remove
      }

      let items: CartItem[] = cartSnap.data()?.items || [];
      items = items.filter(item => item.productId !== productId);

      const { total, itemCount } = calculateCartTotals(items);

      await updateDoc(cartRef, {
        items,
        total,
        itemCount,
        lastUpdated: Timestamp.now(),
      });

      console.log("Item removed from cart successfully");
    } catch (error) {
      console.error("Error removing item from cart at [removeFromCart]:", error);
      throw error;
    }
  },

  // Clear entire cart
  async clearCart(): Promise<void> {
    try {
      const cartRef = doc(db, CARTS_COLLECTION, CURRENT_CUSTOMER_ID);
      await setDoc(cartRef, {
        customerId: CURRENT_CUSTOMER_ID,
        items: [],
        total: 0,
        itemCount: 0,
        lastUpdated: Timestamp.now(),
      });

      console.log("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart at [clearCart]:", error);
      throw error;
    }
  },
};