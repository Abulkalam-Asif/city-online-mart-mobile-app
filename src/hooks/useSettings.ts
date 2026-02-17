import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../services";
import { queryKeys } from "../lib/react-query";
import { AuthSettings, OrderSettings } from "../types";

/**
 * Hook to get authentication settings (e.g. requireOTP)
 */
export function useAuthSettings() {
  return useQuery<AuthSettings | null>({
    queryKey: queryKeys.settings.byDomain("auth"),
    queryFn: () => settingsService.getSettings<AuthSettings>("auth"),
    staleTime: 1000 * 60 * 30, // 30 minutes for mobile optimization
  });
}

/**
 * Hook to get order settings (e.g. deliveryFee, minimumOrderAmount)
 */
export function useOrderSettings() {
  return useQuery<OrderSettings | null>({
    queryKey: queryKeys.settings.byDomain("order"),
    queryFn: () => settingsService.getSettings<OrderSettings>("order"),
    staleTime: 1000 * 60 * 30, // 30 minutes for mobile optimization
  });
}
