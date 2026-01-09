import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import { queryKeys } from "../lib/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductSortType } from "../types";

// Hook to get products by special category
export function useGetProductsBySpecialCategory(specialCategoryId: string) {
  return useQuery({
    queryKey: queryKeys.products.bySpecialCategory(specialCategoryId),
    queryFn: () =>
      productService.getProductsBySpecialCategory(specialCategoryId),
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
    queryKey: [...queryKeys.products.bySubCategoryInfinite(subCategoryId), sortBy, pageSize],
    queryFn: ({ pageParam }) =>
      productService.getPaginatedProductsBySubCategory(subCategoryId, sortBy, pageSize, pageParam),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDocId : undefined,
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
    queryKey: [...queryKeys.products.bySpecialCategoryInfinite(specialCategoryId), sortBy, pageSize],
    queryFn: ({ pageParam }) =>
      productService.getPaginatedProductsBySpecialCategory(specialCategoryId, sortBy, pageSize, pageParam),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDocId : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!specialCategoryId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook to get a product details by ID
// export function useProductById(productId: string) {
//   return useQuery({
//     queryKey: queryKeys.products.detail(productId),
//     queryFn: () => productService.getProductById(productId),
//     enabled: !!productId,
//     staleTime: 1000 * 60 * 2, // 2 minutes
//   });
// }

// Hook for infinite scrolling products by IDs (for similar/bought-together products)
// export function useInfiniteProductsByIds(
//   productIds: string[],
//   type: "similar" | "bought-together",
//   enabled: boolean = true
// ) {
//   return useInfiniteQuery({
//     queryKey: queryKeys.products.byIdsInfinite(productIds, type),
//     queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
//       productService.getProductsByIds(productIds, 5, pageParam ?? 0),
//     getNextPageParam: (lastPage) => {
//       // Return undefined if no more pages, otherwise return the next index
//       return lastPage.nextIndex ?? undefined;
//     },
//     initialPageParam: 0 as number | undefined,
//     enabled: enabled && productIds.length > 0,
//     staleTime: 1000 * 60 * 2, // 2 minutes
//   });
// }
