import { useQuery } from "@tanstack/react-query";
import { discountService } from "../services";
import { queryKeys } from "../lib/react-query";

export function useGetValidOrderDiscounts() {
  return useQuery({
    queryKey: queryKeys.discounts.validOrderDiscounts(),
    queryFn: () => discountService.getValidOrderDiscounts(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}