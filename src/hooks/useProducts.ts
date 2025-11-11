import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import { DocumentSnapshot } from "firebase/firestore";
import { queryKeys } from "../lib/react-query";

const PRODUCTS_PER_PAGE = 10;

// Hook to get a product details by ID
export function useProductById(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for infinite scrolling products by category
export function useInfiniteProductsByCategory(categoryId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.byCategoryInfinite(categoryId),
    queryFn: ({ pageParam }: { pageParam: DocumentSnapshot | undefined }) =>
      productService.getProductsByCategory(
        categoryId,
        PRODUCTS_PER_PAGE,
        pageParam
      ),
    getNextPageParam: (lastPage) => {
      // Return undefined if no more pages, otherwise return the last document
      return lastPage.lastDoc ?? undefined;
    },
    initialPageParam: undefined as DocumentSnapshot | undefined,
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for infinite scrolling products by subcategory
export function useInfiniteProductsBySubCategory(
  parentCategoryId: string,
  subCategoryId: string
) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.bySubCategoryInfinite(
      parentCategoryId,
      subCategoryId
    ),
    queryFn: ({ pageParam }: { pageParam: DocumentSnapshot | undefined }) =>
      productService.getProductsBySubCategory(
        parentCategoryId,
        subCategoryId,
        PRODUCTS_PER_PAGE,
        pageParam
      ),
    getNextPageParam: (lastPage) => {
      // Return undefined if no more pages, otherwise return the last document
      return lastPage.lastDoc ?? undefined;
    },
    initialPageParam: undefined as DocumentSnapshot | undefined,
    enabled: !!parentCategoryId && !!subCategoryId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for infinite scrolling products by IDs (for similar/bought-together products)
export function useInfiniteProductsByIds(
  productIds: string[],
  type: "similar" | "bought-together",
  enabled: boolean = true
) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.byIdsInfinite(productIds, type),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      productService.getProductsByIds(productIds, 5, pageParam ?? 0),
    getNextPageParam: (lastPage) => {
      // Return undefined if no more pages, otherwise return the next index
      return lastPage.nextIndex ?? undefined;
    },
    initialPageParam: 0 as number | undefined,
    enabled: enabled && productIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
