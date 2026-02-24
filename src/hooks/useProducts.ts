import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "../services";
import { queryClient, queryKeys } from "../lib/react-query";
import { Product, ProductSortType } from "../types";

// Hook to get products by special category
export function useGetProductsBySpecialCategory(
  specialCategoryId: string,
  filters?: { limit?: number }
) {
  return useQuery({
    queryKey: queryKeys.products.bySpecialCategory(specialCategoryId, filters),
    queryFn: () =>
      productService.getProductsBySpecialCategory(specialCategoryId, filters),
    enabled: !!specialCategoryId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Indexes required: PRODUCTS
// 1. info.subCategoryId, info.isActive, price (when sortBy="price-asc")
// 2. info.subCategoryId, info.isActive, price (desc), __name__ (desc) (when sortBy="price-desc")
// Hook to get infinite products by sub category
export function useGetInfiniteProductsBySubCategory(
  subCategoryId: string,
  sortBy: ProductSortType,
  pageSize: number,
  enabled: boolean = true
) {
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.products.bySubCategoryInfinite(subCategoryId),
      sortBy,
      pageSize,
    ],
    queryFn: ({ pageParam }) =>
      productService.getPaginatedProductsBySubCategory(
        subCategoryId,
        sortBy,
        pageSize,
        pageParam
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDocId : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!subCategoryId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Indexes required: PRODUCTS
// 1. info.specialCategoryIds, info.isActive, price (when sortBy="price-asc")
// 2. info.specialCategoryIds, info.isActive, price (desc), __name__ (desc) (when sortBy="price-desc")
// Hook to get infinite products by special category
export function useGetInfiniteProductsBySpecialCategory(
  specialCategoryId: string,
  sortBy: ProductSortType,
  pageSize: number,
  enabled: boolean = true
) {
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.products.bySpecialCategoryInfinite(specialCategoryId),
      sortBy,
      pageSize,
    ],
    queryFn: ({ pageParam }) =>
      productService.getPaginatedProductsBySpecialCategory(
        specialCategoryId,
        sortBy,
        pageSize,
        pageParam
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDocId : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!specialCategoryId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook to get product by id
export function useProductById(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 15,
    placeholderData: () => {
      // Search all cached product lists for this product
      const allListCaches = queryClient.getQueriesData<any>({
        queryKey: queryKeys.products.lists(), // matches ALL list caches
      });

      for (const [, data] of allListCaches) {
        if (!data) continue;

        // Flat array (bySpecialCategory)
        if (Array.isArray(data)) {
          const found = data.find((p: Product) => p.id === productId);
          if (found) return found;
        }

        // InfiniteData (bySubCategory / bySpecialCategoryInfinite)
        if (data.pages) {
          for (const page of data.pages) {
            const found = page.items?.find((p: Product) => p.id === productId);
            if (found) return found;
          }
        }
      }
      return undefined;
    },
  });
}