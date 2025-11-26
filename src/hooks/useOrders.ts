import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { orderService } from "../services/OrderService";
import { Order, OrderItem, PaymentMethod } from "../types";

// Hook for fetching customer orders
export function useGetCustomerOrders(customerId: string) {
  return useQuery({
    queryKey: queryKeys.orders.lists(),
    queryFn: () => orderService.getCustomerOrders(customerId),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 2, // 2 minutes - orders update frequently
  });
}

// Hook for fetching a single order by ID
export function useGetOrderById(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes - order details don't change often
  });
}

// Hook for placing an order (mutation)
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: {
      customerId: string;
      items: OrderItem[];
      subtotal: number;
      discount: number;
      deliveryFee: number;
      total: number;
      paymentMethod: PaymentMethod;
      deliveryAddress: string;
      proofOfPaymentUrl?: string;
    }) => orderService.placeOrder(orderData),
    onSuccess: (orderId, variables) => {
      // Invalidate customer orders to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.lists(),
      });

      // Invalidate user profile to update order stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(),
      });

      console.log("Order placed successfully:", orderId);
    },
    onError: (error) => {
      console.error("Failed to place order:", error);
    },
  });
}