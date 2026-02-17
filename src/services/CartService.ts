import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cart, ICartItem } from "../types";
import { logger } from "../utils/logger";


export class CartService {
  /**
   * Storage key for cart data
   */
  private static readonly CART_STORAGE_KEY = "@cart_data";

  /**
   * Calculates the total price of all items in the cart.
   * @param items - The array of cart items.
   * @returns The total price of all items in the cart.
   */
  private static calculateCartTotal = (items: ICartItem[]): number => {
    return items.reduce(
      (sum, item) => sum + (item.discountedUnitPrice * item.quantity),
      0
    );
  }

  /**
   * Helper function to get cart from AsyncStorage
   * @returns The cart data from AsyncStorage.
   */
  private static getStoredCart = async (): Promise<Cart | null> => {
    try {
      const cartJson = await AsyncStorage.getItem(CartService.CART_STORAGE_KEY);
      if (cartJson) {
        const cartData = JSON.parse(cartJson);
        return cartData;
      }
      return null;
    } catch (error) {
      logger.error("getStoredCart", error);
      return null;
    }
  }

  /**
   * Helper function to save cart to AsyncStorage
   * @param cart - The cart data to save.
   */
  private static saveCart = async (cart: Cart): Promise<void> => {
    try {
      const cartJson = JSON.stringify(cart);
      await AsyncStorage.setItem(CartService.CART_STORAGE_KEY, cartJson);
    } catch (error) {
      logger.error("saveCart", error);
      throw error;
    }
  }

  /**
   * Get cart for current customer
   * @returns The cart data for the current customer.
   */
  async getCart(): Promise<Cart | null> {
    try {
      const storedCart = await CartService.getStoredCart();
      if (!storedCart) {
        // Return empty cart if none exists
        return {
          items: [],
          total: 0,
        }
      }

      return storedCart;
    } catch (error) {
      logger.error("getCart", error);
      throw error;
    }
  }

  /**
   * Add item to cart
   * @param productId - The ID of the product to add to the cart.
   * @param productName - The name of the product to add to the cart.
   * @param unitPrice - The unit price of the product to add to the cart.
   * @param quantity - The quantity of the product to add to the cart.
   * @param imageUrl - The image URL of the product to add to the cart.
   */
  async addToCart(
    productId: string,
    productName: string,
    unitPrice: number,
    discountPercentage: number,
    quantity: number,
    imageUrl: string,
  ): Promise<void> {
    try {
      const cart = (await CartService.getStoredCart()) || {
        items: [],
        total: 0,
      }

      let items: ICartItem[] = cart.items || [];

      // Check if item already exists
      const existingItemIndex = items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: ICartItem = {
          productId,
          productName,
          quantity,
          unitPrice,
          discountPercentage,
          imageUrl,
          discountedUnitPrice: discountPercentage > 0 ? Math.floor(unitPrice - (unitPrice * discountPercentage / 100)) : unitPrice,
        }
        items.push(newItem);
      }

      const total = CartService.calculateCartTotal(items);

      const updatedCart: Cart = {
        items,
        total,
      }

      await CartService.saveCart(updatedCart);
    } catch (error) {
      logger.error("addToCart", error);
      throw error;
    }
  }

  /**
   * Update item quantity in cart
   * @param productId - The ID of the product to update in the cart.
   * @param quantity - The new quantity of the product to update in the cart.
   */
  async updateCartItem(productId: string, quantity: number): Promise<void> {
    try {
      const cart = await CartService.getStoredCart();

      if (!cart) {
        throw new Error("Cart not found");
      }

      let items: ICartItem[] = cart.items || [];
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

      const total = CartService.calculateCartTotal(items);

      const updatedCart: Cart = {
        ...cart,
        items,
        total,
      }

      await CartService.saveCart(updatedCart);
    } catch (error) {
      logger.error("updateCartItem", error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param productId - The ID of the product to remove from the cart.
   */
  async removeFromCart(productId: string): Promise<void> {
    try {
      const cart = await CartService.getStoredCart();

      if (!cart) {
        return; // Cart doesn't exist, nothing to remove
      }

      let items: ICartItem[] = cart.items || [];
      items = items.filter((item) => item.productId !== productId);

      const total = CartService.calculateCartTotal(items);

      const updatedCart: Cart = {
        ...cart,
        items,
        total,
      }

      await CartService.saveCart(updatedCart);
    } catch (error) {
      logger.error("removeFromCart", error);
      throw error;
    }
  }

  /**
   * Update applied order discount
   * @param discountId - The ID of the discount to apply.
   * @param discountName - The name of the discount to apply.
   * @param discountPercentage - The percentage of the discount to apply.
   * @param discountAmount - The amount of the discount to apply.
   */
  async updateAppliedOrderDiscount(
    discountId: string,
    discountName: string,
    discountPercentage: number,
    discountAmount: number
  ): Promise<void> {
    const cart = await CartService.getStoredCart();
    if (!cart) return;

    const updatedCart: Cart = {
      ...cart,
      appliedOrderDiscount: {
        id: discountId,
        name: discountName,
        percentage: discountPercentage,
        amount: discountAmount
      }
    };

    await CartService.saveCart(updatedCart);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    try {
      const emptyCart: Cart = {
        items: [],
        total: 0,
      }

      await CartService.saveCart(emptyCart);
    } catch (error) {
      logger.error("clearCart", error);
      throw error;
    }
  }
}
