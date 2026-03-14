import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services";
import { Order } from "../types";
import { queryKeys } from "../lib/react-query";

/**
 * Mutation hook to place a new order.
 * The payload only needs {productId, quantity} pairs — the OrderService
 * recalculates all pricing server-side for security.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: Parameters<typeof orderService.createOrder>[0]) => {
      return await orderService.createOrder(orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
    },
  });
}

/**
 * Mutation hook to submit payment proof for an existing order.
 */
export function useSubmitPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, imageUri }: { orderId: string; imageUri: string }) => {
      return await orderService.submitPaymentProof(orderId, imageUri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
    },
  });
}

/**
 * Mutation hook to update order details (address, payment method) on back-navigation.
 */
export function useUpdateOrderDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      updates,
    }: {
      orderId: string;
      updates: Parameters<typeof orderService.updateOrderDetails>[1];
    }) => {
      return await orderService.updateOrderDetails(orderId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
    },
  });
}

/**
 * Query hook to fetch all orders for a specific customer.
 */
export function useGetCustomerOrders(customerId: string) {
  return useQuery({
    queryKey: queryKeys.user.orders(),
    queryFn: () => orderService.getCustomerOrders(customerId),
    enabled: !!customerId,
  });
}
