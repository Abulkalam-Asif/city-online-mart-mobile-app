import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { categoryService } from "../services/categoryService";

// Hook for fetching all categories
export function useGetAllCategories() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes - categories don't change often
  });
}

// Hook for fetching categories for homepage
export function useGetCategoriesForHomepage() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: () =>
      categoryService.getAllCategories({
        isActive: true,
        showOnHomepage: true,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes - categories don't change often
  });
}

export function useGetAllCategoriesWithSubCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list({ withSubCategories: true }),
    queryFn: () => categoryService.getAllCategoriesWithSubCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes - categories don't change often
  });
}
