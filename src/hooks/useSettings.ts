import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../services";
import { queryKeys } from "../lib/react-query";
import { AuthSettings } from "../types";

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
