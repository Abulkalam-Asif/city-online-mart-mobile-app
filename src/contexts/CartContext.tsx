import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Cart, ICartItem } from "../types";
import { cartService } from "../services";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isPending: boolean;
  addToCart: (
    productId: string,
    productName: string,
    unitPrice: number,
    discountPercentage: number,
    quantity: number,
    imageUrl: string,
    appliedDiscountId?: string,
    appliedDiscountSource?: string
  ) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateAppliedOrderDiscount: (
    discountId: string,
    discountName: string,
    discountPercentage: number,
    discountAmount: number
  ) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await cartService.getCart();
        setCart(storedCart);
      } catch (error) {
        console.error("[CartContext] Failed to load cart:", error);
        setCart({ items: [], itemsSubtotal: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Helper to calculate cart items subtotal
  const calculateCartItemsSubtotal = useCallback((items: ICartItem[]): number => {
    return items.reduce((sum, item) => sum + item.discountedUnitPrice * item.quantity, 0);
  }, []);

  // Persistence logic - debounced to avoid race conditions and overlapping writes
  useEffect(() => {
    if (loading || !cart) return;

    const timer = setTimeout(async () => {
      try {
        setIsPending(true);
        await cartService.saveCartDirectly(cart);
      } catch (error) {
        console.error("[CartContext] Failed to persist cart:", error);
      } finally {
        setIsPending(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [cart, loading]);

  const addToCart = useCallback(
    (
      productId: string,
      productName: string,
      unitPrice: number,
      discountPercentage: number,
      quantity: number,
      imageUrl: string,
      appliedDiscountId?: string,
      appliedDiscountSource?: string
    ) => {
      setCart((prevCart) => {
        const currentCart = prevCart || { items: [], itemsSubtotal: 0 };
        let items = [...currentCart.items];

        const existingItemIndex = items.findIndex((item) => item.productId === productId);

        if (existingItemIndex >= 0) {
          items[existingItemIndex] = {
            ...items[existingItemIndex],
            quantity: items[existingItemIndex].quantity + quantity,
            discountPercentage,
            discountedUnitPrice:
              discountPercentage > 0
                ? Math.round(unitPrice - (unitPrice * discountPercentage) / 100)
                : unitPrice,
            appliedDiscountId,
            appliedDiscountSource,
          };
        } else {
          const newItem: ICartItem = {
            productId,
            productName,
            quantity,
            unitPrice,
            discountPercentage,
            imageUrl,
            discountedUnitPrice:
              discountPercentage > 0
                ? Math.round(unitPrice - (unitPrice * discountPercentage) / 100)
                : unitPrice,
            appliedDiscountId,
            appliedDiscountSource,
          };
          items.push(newItem);
        }

        const itemsSubtotal = calculateCartItemsSubtotal(items);
        return { ...currentCart, items, itemsSubtotal };
      });
    },
    [calculateCartItemsSubtotal]
  );

  const updateCartItem = useCallback(
    (productId: string, quantity: number) => {
      setCart((prevCart) => {
        if (!prevCart) return prevCart;

        let items = [...prevCart.items];
        const itemIndex = items.findIndex((item) => item.productId === productId);

        if (itemIndex === -1) return prevCart;

        if (quantity <= 0) {
          items.splice(itemIndex, 1);
        } else {
          items[itemIndex] = { ...items[itemIndex], quantity };
        }

        const itemsSubtotal = calculateCartItemsSubtotal(items);
        return { ...prevCart, items, itemsSubtotal };
      });
    },
    [calculateCartItemsSubtotal]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) => {
        if (!prevCart) return prevCart;

        const items = prevCart.items.filter((item) => item.productId !== productId);
        const itemsSubtotal = calculateCartItemsSubtotal(items);
        return { ...prevCart, items, itemsSubtotal };
      });
    },
    [calculateCartItemsSubtotal]
  );

  const clearCart = useCallback(() => {
    setCart({ items: [], itemsSubtotal: 0 });
  }, []);

  const updateAppliedOrderDiscount = useCallback(
    (discountId: string, discountName: string, discountPercentage: number, discountAmount: number) => {
      setCart((prevCart) => {
        if (!prevCart) return prevCart;

        return {
          ...prevCart,
          appliedOrderDiscount: {
            id: discountId,
            name: discountName,
            percentage: discountPercentage,
            amount: discountAmount,
          },
        };
      });
    },
    []
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isPending,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        updateAppliedOrderDiscount,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Alias for explicit context usage
export const useCartContext = useCart;
