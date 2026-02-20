/**
 * Cart hooks - now powered by CartContext for real-time updates.
 * AsyncStorage is used only for persistence.
 */
import { useCart } from "../contexts/CartContext";

export { useCart };

// Re-export individual action hooks for backwards compatibility
export function useAddToCart() {
  const { addToCart, isPending } = useCart();
  return {
    mutate: (params: {
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      discountPercentage: number;
      imageUrl: string;
      appliedDiscountId?: string;
      appliedDiscountSource?: string;
    }) =>
      addToCart(
        params.productId,
        params.productName,
        params.unitPrice,
        params.discountPercentage,
        params.quantity,
        params.imageUrl,
        params.appliedDiscountId,
        params.appliedDiscountSource
      ),
    isPending,
  };
}

export function useUpdateCartItem() {
  const { updateCartItem, isPending } = useCart();
  return {
    mutate: (
      params: { productId: string; quantity: number },
      options?: { onError?: (error: Error) => void }
    ) => {
      try {
        updateCartItem(params.productId, params.quantity);
      } catch (error) {
        options?.onError?.(error as Error);
      }
    },
    isPending,
  };
}

export function useRemoveFromCart() {
  const { removeFromCart, isPending } = useCart();
  return {
    mutate: (productId: string) => removeFromCart(productId),
    isPending,
  };
}

export function useClearCart() {
  const { clearCart, isPending } = useCart();
  return {
    mutate: () => clearCart(),
    isPending,
  };
}

export function useCartItemCount() {
  const { cart } = useCart();
  return cart ? cart.items.length : 0;
}
