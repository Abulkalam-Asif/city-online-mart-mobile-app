import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { cartService } from "../services";

// Hook for fetching current cart
export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 2, // 2 minutes - cart changes frequently
  });
}

/**
 * Hook for adding item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      productName,
      unitPrice,
      quantity,
      discountPercentage,
      imageUrl,
    }: {
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      discountPercentage: number;
      imageUrl: string;
    }) =>
      cartService.addToCart(
        productId,
        productName,
        unitPrice,
        discountPercentage,
        quantity,
        imageUrl
      ),
    onSuccess: () => {
      // Invalidate cart to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.current(),
      });
    },
  });
}

/**
 * Hook for updating cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => cartService.updateCartItem(productId, quantity),
    onSuccess: () => {
      // Invalidate cart to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.current(),
      });
    },
  });
}

/**
 * Hook for removing item from cart
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => cartService.removeFromCart(productId),
    onSuccess: () => {
      // Invalidate cart to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.current(),
      });
    },
  });
}

/**
 * Hook for clearing cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      // Invalidate cart to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.current(),
      });
    },
  });
}

/**
 * Hook for getting cart item count
 */
export function useCartItemCount() {
  const cartQuery = useCart();
  return cartQuery.data ? cartQuery.data.items.length : 0;
}
