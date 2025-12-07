import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cart, CartItem } from "../types";

// Storage key for cart data
const CART_STORAGE_KEY = "@cart_data";

// Helper function to calculate cart total
const calculateCartTotal = (items: CartItem[]) => {
  return items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
};

// Helper function to get cart from AsyncStorage
const getStoredCart = async (): Promise<Cart | null> => {
  try {
    const cartJson = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (cartJson) {
      const cartData = JSON.parse(cartJson);
      return cartData;
    }
    return null;
  } catch (error) {
    console.error("Error reading cart from storage:", error);
    return null;
  }
};

// Helper function to save cart to AsyncStorage
const saveCart = async (cart: Cart): Promise<void> => {
  try {
    const cartJson = JSON.stringify(cart);
    await AsyncStorage.setItem(CART_STORAGE_KEY, cartJson);
  } catch (error) {
    console.error("Error saving cart to storage:", error);
    throw error;
  }
};

export const cartService = {
  // Get cart for current customer
  async getCart(): Promise<Cart | null> {
    try {
      const storedCart = await getStoredCart();
      if (!storedCart) {
        // Return empty cart if none exists
        return {
          items: [],
          total: 0,
        };
      }

      return storedCart;
    } catch (error) {
      console.error("Error fetching cart at [getCart]:", error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(
    productId: string,
    productName: string,
    unitPrice: number,
    quantity: number = 1,
    imageUrl: string = ""
  ): Promise<void> {
    try {
      const cart = (await getStoredCart()) || {
        items: [],
        total: 0,
      };

      let items: CartItem[] = cart.items || [];

      // Check if item already exists
      const existingItemIndex = items.findIndex(
        (item) => item.productId === productId
      );

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
          imageUrl,
        };
        items.push(newItem);
      }

      const total = calculateCartTotal(items);

      const updatedCart: Cart = {
        items,
        total,
      };

      await saveCart(updatedCart);
    } catch (error) {
      console.error("Error adding item to cart at [addToCart]:", error);
      throw error;
    }
  },

  // Update item quantity in cart
  async updateCartItem(productId: string, quantity: number): Promise<void> {
    try {
      const cart = await getStoredCart();

      if (!cart) {
        throw new Error("Cart not found");
      }

      let items: CartItem[] = cart.items || [];
      const itemIndex = items.findIndex((item) => item.productId === productId);

      if (itemIndex === -1) {
        throw new Error("Item not found in cart");
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }

      const total = calculateCartTotal(items);

      const updatedCart: Cart = {
        ...cart,
        items,
        total,
      };

      await saveCart(updatedCart);
    } catch (error) {
      console.error("Error updating cart item at [updateCartItem]:", error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId: string): Promise<void> {
    try {
      const cart = await getStoredCart();

      if (!cart) {
        return; // Cart doesn't exist, nothing to remove
      }

      let items: CartItem[] = cart.items || [];
      items = items.filter((item) => item.productId !== productId);

      const total = calculateCartTotal(items);

      const updatedCart: Cart = {
        ...cart,
        items,
        total,
      };

      await saveCart(updatedCart);
    } catch (error) {
      console.error(
        "Error removing item from cart at [removeFromCart]:",
        error
      );
      throw error;
    }
  },

  // Clear entire cart
  async clearCart(): Promise<void> {
    try {
      const emptyCart: Cart = {
        items: [],
        total: 0,
      };

      await saveCart(emptyCart);
    } catch (error) {
      console.error("Error clearing cart at [clearCart]:", error);
      throw error;
    }
  },
};
