import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import bannerService from "../services/bannerService";

// Hook for fetching popup banner
export function useGetPopupBanner() {
  return useQuery({
    queryKey: queryKeys.banners.popup,
    queryFn: () => bannerService.getPopupBanner(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching homepage banners
export function useGetHomepageBanners() {
  return useQuery({
    queryKey: queryKeys.banners.homepage,
    queryFn: () => bannerService.getHomepageBanners(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
