import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import bannerService from "../services/bannerSerivce";

// Hook for fetching all active slide banners
export function useActiveSlideBanners() {
  return useQuery({
    queryKey: queryKeys.banners.slides(),
    queryFn: () => bannerService.getActiveSlideBanners(),
    staleTime: 1000 * 60 * 10, // 10 minutes - banners don't change often
  });
}

// Hook for fetching the main banner
export function useMainBanner() {
  return useQuery({
    queryKey: queryKeys.banners.main(),
    queryFn: () => bannerService.getMainBanner(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching banners by placement
export function useBannersByPlacement(
  placement:
    | "homepage_main"
    | "homepage_secondary"
    | "category_page"
    | "product_page"
) {
  return useQuery({
    queryKey: queryKeys.banners.byPlacement(placement),
    queryFn: () => bannerService.getBannersByPlacement(placement),
    staleTime: 1000 * 60 * 10,
  });
}
