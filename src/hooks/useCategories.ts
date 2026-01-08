import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { categoryService } from "../services/categoryService";

// Index required: CATEGORIES
// isActive, showOnHomepage, displayOrder, __name__
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
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Index required: CATEGORIES
// isActive, type, displayOrder, productsCount, __name__
// Hook for fetching special categories for homepage
export function useGetSpecialCategories({
  productsCountGreaterThanZero,
}: { productsCountGreaterThanZero?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.categories.list({
      isActive: true,
      special: true,
      productsCountGreaterThanZero: productsCountGreaterThanZero,
    }),
    queryFn: () => {
      return categoryService.getCategories({
        isActive: true,
        type: "special",
        productsCountGreaterThanZero,
      });
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Index required: CATEGORIES
// isActive, showOnNavbar, displayOrder, __name__
// Hook for fetching categories for navbar
export function useGetCategoriesForNavbar() {
  return useQuery({
    queryKey: queryKeys.categories.list({
      isActive: true,
      showOnNavbar: true,
    }),
    queryFn: () => {
      return categoryService.getCategories({
        isActive: true,
        showOnNavbar: true,
      });
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Index required: SUB_CATEGORIES
// isActive, showOnNavbar, parentCategoryId, displayOrder, __name__
// Hook for fetching subcategories by parent category ID for navbar
export function useGetSubCategoriesByCategoryIdForNavbar(
  parentCategoryId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.subCategories.byParentCategory(parentCategoryId, {
      isActive: true,
      showOnNavbar: true,
    }),
    queryFn: () =>
      categoryService.getSubCategories(parentCategoryId, {
        isActive: true,
        showOnNavbar: true,
      }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!parentCategoryId && enabled,
  });
}
