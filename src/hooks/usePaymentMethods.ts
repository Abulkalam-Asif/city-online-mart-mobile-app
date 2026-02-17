import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { paymentMethodService } from "../services";

// Hook for fetching active payment methods
export function useGetAllPaymentMethods() {
  return useQuery({
    queryKey: queryKeys.paymentMethods.all,
    queryFn: () => paymentMethodService.getAllPaymentMethods(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
