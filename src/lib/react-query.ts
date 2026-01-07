import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 2 times
      retry: 2,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus (mobile doesn't need this)
      refetchOnWindowFocus: false,
      // Refetch on reconnect only if stale
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

/**
 * Query Keys Factory
 *
 * Best Practices:
 * 1. Use hierarchical structure: [domain, entity, ...details]
 * 2. Most general keys first, specific details later
 * 3. Use functions for dynamic keys
 * 4. Keep consistent ordering for similar queries
 *
 * Examples:
 * - ["products"] - Matches ALL product queries
 * - ["products", "list"] - All product lists
 * - ["products", "list", "category", "123"] - Specific category list
 * - ["products", "detail", "456"] - Single product detail
 */
export const queryKeys = {
  // ========================================
  // CATEGORIES
  // ========================================
  categories: {
    // Base key - invalidates ALL category queries
    all: ["categories"] as const,

    // List variations
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (filters?: {
      isActive?: boolean;
      showOnNavbar?: boolean;
      showOnHomepage?: boolean;
      special?: boolean;
      productsCountGreaterThanZero?: boolean;
    }) => [...queryKeys.categories.lists(), filters] as const,
  },

  // ========================================
  // SUB CATEGORIES
  // ========================================
  subCategories: {
    all: ["subCategories"] as const,

    byParentCategory: (
      parentCategoryId: string,
      filters?: {
        isActive?: boolean;
        showOnNavbar?: boolean;
      }
    ) =>
      [
        ...queryKeys.subCategories.all,
        "byParentCategory",
        parentCategoryId,
        filters,
      ] as const,
  },

  // ========================================
  // PRODUCTS
  // ========================================
  products: {
    // Base key - invalidates ALL product queries
    all: ["products"] as const,

    // Lists (paginated or infinite scroll)
    lists: () => [...queryKeys.products.all, "list"] as const,

    // By category (infinite scroll)
    byCategory: (categoryId: string) =>
      [...queryKeys.products.lists(), "category", categoryId] as const,
    byCategoryInfinite: (categoryId: string) =>
      [...queryKeys.products.byCategory(categoryId), "infinite"] as const,
    bySpecialCategory: (specialCategoryId: string) =>
      [
        ...queryKeys.products.lists(),
        "specialCategory",
        specialCategoryId,
      ] as const,

    // By subcategory (infinite scroll)
    bySubCategory: (parentCategoryId: string, subCategoryId: string) =>
      [
        ...queryKeys.products.lists(),
        "subcategory",
        parentCategoryId,
        subCategoryId,
      ] as const,
    bySubCategoryInfinite: (parentCategoryId: string, subCategoryId: string) =>
      [
        ...queryKeys.products.bySubCategory(parentCategoryId, subCategoryId),
        "infinite",
      ] as const,

    // By IDs (for similar products, bought together, etc.)
    byIds: (productIds: string[], type: "similar" | "bought-together") =>
      [
        ...queryKeys.products.lists(),
        "byIds",
        type,
        productIds.join(","),
      ] as const,
    byIdsInfinite: (
      productIds: string[],
      type: "similar" | "bought-together"
    ) => [...queryKeys.products.byIds(productIds, type), "infinite"] as const,

    // Special lists
    featured: () => [...queryKeys.products.lists(), "featured"] as const,
    new: () => [...queryKeys.products.lists(), "new"] as const,
    onSale: () => [...queryKeys.products.lists(), "onSale"] as const,
    bestPrices: (limit: number) =>
      [...queryKeys.products.lists(), "bestPrices", limit] as const,

    // Search
    search: (query: string, filters?: Record<string, any>) =>
      [...queryKeys.products.lists(), "search", query, filters] as const,

    // Single product detail
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,

    // Product reviews
    reviews: (productId: string) =>
      [...queryKeys.products.detail(productId), "reviews"] as const,
  },

  // ========================================
  // BANNERS
  // ========================================
  banners: {
    popup: ["banners", "popup"] as const,
    homepage: ["banners", "homepage"] as const,
  },

  // ========================================
  // PAYMENT METHODS
  // ========================================
  paymentMethods: {
    // Base key - invalidates ALL payment method queries
    all: ["paymentMethods"] as const,

    // Active payment methods
    active: () => [...queryKeys.paymentMethods.all, "active"] as const,

    // Single payment method detail
    details: () => [...queryKeys.paymentMethods.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.paymentMethods.details(), id] as const,
  },

  // ========================================
  // ORDERS
  // ========================================
  orders: {
    // Base key - invalidates ALL order queries
    all: ["orders"] as const,

    // Lists
    lists: () => [...queryKeys.orders.all, "list"] as const,
    byStatus: (status: string) =>
      [...queryKeys.orders.lists(), "status", status] as const,

    // Single order detail
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // ========================================
  // CART
  // ========================================
  cart: {
    // Base key - invalidates ALL cart queries
    all: ["cart"] as const,

    // Current user's cart
    current: () => [...queryKeys.cart.all, "current"] as const,
  },

  // ========================================
  // USER/CUSTOMER
  // ========================================
  user: {
    // Base key
    all: ["user"] as const,

    // User data
    profile: () => [...queryKeys.user.all, "profile"] as const,
    addresses: () => [...queryKeys.user.all, "addresses"] as const,
    wishlist: () => [...queryKeys.user.all, "wishlist"] as const,
  },
};
