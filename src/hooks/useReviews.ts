import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { reviewService } from "../services";
import type { SaveReviewInput } from "../services/ReviewService";
import { queryKeys } from "../lib/react-query";
import { useProductsByIds } from "./useProducts";
import { getRefundedQuantities } from "../utils/refundUtils";
import type { Order, OrderItem } from "../types/order.types";

/**
 * Average rating and review count of a product (computed by Firestore).
 */
export function useRatingSummary(productId?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(productId ?? ""),
    queryFn: () => reviewService.getRatingSummary(productId!),
    enabled: !!productId,
  });
}

/**
 * Infinite query for a product's reviews, newest first.
 */
export function useProductReviews(productId?: string, pageSize = 10) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.reviews.list(productId ?? ""), pageSize],
    queryFn: ({ pageParam }) =>
      reviewService.getProductReviews(productId!, pageSize, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDocId : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!productId,
  });
}

/**
 * Ids of the products the customer has reviewed (the Orders list uses it to stop inviting a
 * review that was already written).
 */
export function useReviewedProductIds(customerId?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.reviewed(customerId ?? ""),
    queryFn: () => reviewService.getReviewedProductIds(customerId!),
    enabled: !!customerId,
  });
}

/**
 * The signed-in customer's own reviews of the given products (to prefill the rating screen).
 */
export function useCustomerReviews(customerId?: string, productIds: string[] = []) {
  return useQuery({
    queryKey: queryKeys.reviews.mine(customerId ?? "", productIds),
    queryFn: () => reviewService.getCustomerReviews(productIds, customerId!),
    enabled: !!customerId && productIds.length > 0,
  });
}

/**
 * Mutation hook to save the reviews of one order's items. Each review is its own write, so one
 * failing (for example a product whose reviews were switched off meanwhile) does not stop the
 * others; the mutation then fails with the number that could not be saved.
 */
export function useSaveReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviews: SaveReviewInput[]) => {
      const results = await Promise.allSettled(
        reviews.map((review) => reviewService.saveReview(review)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;

      // Remember which products now have a review. It only feeds the Orders list, so a failure
      // here must not turn a saved review into an error.
      const savedProductIds = reviews
        .filter((_, index) => results[index].status === "fulfilled")
        .map((review) => review.productId);
      if (savedProductIds.length > 0) {
        await reviewService
          .markProductsReviewed(reviews[0].customerId, savedProductIds)
          .catch(() => { });
      }

      if (failed > 0) {
        throw new Error(
          reviews.length === 1
            ? "Your review could not be saved. Reviews may have been turned off for this product."
            : `${failed} of ${reviews.length} reviews could not be saved. Reviews may have been turned off for some products.`,
        );
      }
    },
    // Also after a partial failure: the ones that did save should show up
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}

/**
 * The items of a delivered order that the customer can review, and their reviews so far.
 * Left out: items that were fully refunded, products whose reviews are switched off (a missing
 * setting counts as on) and products that no longer exist (the rules refuse those too).
 */
export function useOrderReviewItems(order: Order | null | undefined, customerId?: string) {
  const isDelivered = order?.status === "delivered";

  const notRefunded = useMemo<OrderItem[]>(() => {
    if (!order || !isDelivered) return [];
    const refunded = getRefundedQuantities(order);
    return order.items.filter((item) => (refunded[item.productId] || 0) < item.quantity);
  }, [order, isDelivered]);

  const productsQuery = useProductsByIds(notRefunded.map((item) => item.productId));

  const items = useMemo<OrderItem[]>(() => {
    const reviewable = new Set(
      (productsQuery.data ?? [])
        .filter((product) => product.info.allowCustomerReviews !== false)
        .map((product) => product.id),
    );
    return notRefunded.filter((item) => reviewable.has(item.productId));
  }, [notRefunded, productsQuery.data]);

  const reviewsQuery = useCustomerReviews(
    customerId,
    items.map((item) => item.productId),
  );

  // Reviews written before the "reviewed" list existed: add them once, so the Orders list stops
  // inviting a review that is already there.
  const queryClient = useQueryClient();
  const reviewedIds = useReviewedProductIds(customerId);
  const healed = useRef(false);
  useEffect(() => {
    if (healed.current || !customerId || !reviewedIds.data || !reviewsQuery.data) return;
    const missing = Object.keys(reviewsQuery.data).filter((id) => !reviewedIds.data.includes(id));
    if (missing.length === 0) return;
    healed.current = true;
    reviewService
      .markProductsReviewed(customerId, missing)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.reviewed(customerId) }),
      )
      .catch(() => { });
  }, [customerId, reviewedIds.data, reviewsQuery.data, queryClient]);

  return {
    items,
    reviews: reviewsQuery.data ?? {},
    isLoading:
      productsQuery.isLoading || (items.length > 0 && reviewsQuery.isLoading),
    isError: productsQuery.isError || reviewsQuery.isError,
    refetch: () => {
      productsQuery.refetch();
      reviewsQuery.refetch();
    },
  };
}
