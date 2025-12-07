import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { paymentMethodService } from "../services/paymentMethodService";

// Hook for fetching active payment methods
export function useGetActivePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.paymentMethods.active(),
    queryFn: () => paymentMethodService.getActivePaymentMethods(),
    staleTime: 1000 * 60 * 10, // 10 minutes - payment methods don't change often
  });
}

// Hook for fetching a single payment method by ID
export function useGetPaymentMethodById(paymentMethodId: string) {
  return useQuery({
    queryKey: queryKeys.paymentMethods.detail(paymentMethodId),
    queryFn: () => paymentMethodService.getPaymentMethodById(paymentMethodId),
    enabled: !!paymentMethodId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}