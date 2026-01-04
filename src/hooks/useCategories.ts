import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { categoryService } from "../services/categoryService";

// Hook for fetching categories for homepage
export function useGetCategoriesForHomepage() {
  return useQuery({
    queryKey: queryKeys.categories.list({
      isActive: true,
      showOnHomepage: true,
    }),
    queryFn: () =>
      categoryService.getCategories({
        isActive: true,
        showOnHomepage: true,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useGetAllCategoriesWithSubCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list({ withSubCategories: true }),
    queryFn: () => categoryService.getAllCategoriesWithSubCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes - categories don't change often
  });
}

// Hook for fetching special categories for homepage
export function useGetSpecialCategoriesForHomepage() {
  return useQuery({
    queryKey: queryKeys.categories.list({
      special: true,
      showOnHomepage: true,
    }),
    queryFn: () => categoryService.getSpecialCategoriesForHomepage(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
