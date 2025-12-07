import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { cartService } from "../services/cartService";

// Hook for fetching current cart
export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 2, // 2 minutes - cart changes frequently
  });
}

// Hook for adding item to cart
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      productName,
      unitPrice,
      quantity = 1,
      imageUrl = "",
    }: {
      productId: string;
      productName: string;
      unitPrice: number;
      quantity?: number;
      imageUrl?: string;
    }) =>
      cartService.addToCart(
        productId,
        productName,
        unitPrice,
        quantity,
        imageUrl
      ),
    onSuccess: () => {
      // Invalidate cart to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.current(),
      });
    },
    onError: (error) => {
      console.error("Failed to add item to cart:", error);
    },
  });
}

// Hook for updating cart item quantity
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
    onError: (error) => {
      console.error("Failed to update cart item:", error);
    },
  });
}

// Hook for removing item from cart
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
    onError: (error) => {
      console.error("Failed to remove item from cart:", error);
    },
  });
}

// Hook for clearing cart
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
    onError: (error) => {
      console.error("Failed to clear cart:", error);
    },
  });
}
