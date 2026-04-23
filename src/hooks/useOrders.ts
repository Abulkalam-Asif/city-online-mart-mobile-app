import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { orderService } from "../services";
import { queryKeys } from "../lib/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { Order } from "../types/order.types";
import type { PaginatedResult } from "../types/common.types";

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

/**
 * Query hook to fetch a single order by ID.
 * Uses cached orders list data when available to minimize reads.
 */
export function useGetOrderById(orderId?: string) {
  const queryClient = useQueryClient();

  const getCachedOrder = () => {
    if (!orderId) return undefined;

    const cachedQueries = queryClient.getQueriesData<InfiniteData<PaginatedResult<Order>>>({
      queryKey: queryKeys.user.orders(),
    });

    for (const [key, data] of cachedQueries) {
      if (!data) continue;
      const match = data.pages
        .flatMap((page) => page.items)
        .find((order) => order.id === orderId);
      if (match) {
        const state = queryClient.getQueryState(key as any);
        return { order: match, updatedAt: state?.dataUpdatedAt };
      }
    }

    return undefined;
  };

  const cached = getCachedOrder();

  return useQuery({
    queryKey: [...queryKeys.user.orders(), "detail", orderId],
    queryFn: () => (orderId ? orderService.getOrderById(orderId) : Promise.resolve(null)),
    enabled: !!orderId,
    initialData: cached?.order,
    initialDataUpdatedAt: cached?.updatedAt,
  });
}

/**
 * Infinite query hook to fetch customer orders with pagination.
 */
export function useGetInfiniteCustomerOrders(
  customerId: string,
  pageSize: number,
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.user.orders(), "infinite", customerId, pageSize],
    queryFn: ({ pageParam }) =>
      orderService.getPaginatedCustomerOrders(customerId, pageSize, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDocId : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5,
  });
}
