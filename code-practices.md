# Service-Hook Architecture Guide

This guide documents the service-hook architecture pattern used in this React Native e-commerce application for organizing business logic and database interactions.

## Overview

The architecture follows a clean separation of concerns with two main layers:

1. **Services Layer** - Handles database operations and business logic
2. **Hooks Layer** - Provides React Query-based data fetching with caching and state management

## Services Layer

### Location
All services are located in `src/services/` directory.

### Structure
Each service is a JavaScript object exported as a default or named export, containing methods for specific domain operations.

```typescript
// Example service structure
export const exampleService = {
  // Method definitions
  async getData(): Promise<DataType> {
    // Implementation
  }
};
```

### Responsibilities

#### Database Interactions
- Direct Firestore operations (queries, document fetching)
- Collection and document references
- Query building with filters, ordering, and pagination

```typescript
// src/services/CategoryService.ts
const categoriesRef = collection(db, CATEGORIES_COLLECTION);
const q = query(
  categoriesRef,
  where("isActive", "==", true),
  orderBy("displayOrder", "asc")
);
const snapshot = await getDocs(q);
```

#### Business Logic
- Data transformation and mapping
- Complex calculations and validations
- Pagination logic
- Error handling and logging

```typescript
// Helper function for data transformation
const firestoreToCategory = (id: string, data: any): Category => {
  return {
    id,
    name: data.name || "",
    slug: data.slug || "",
    // ... other mappings
  };
};
```

#### Error Handling
- Consistent error logging with descriptive messages
- Error propagation to calling layers
- Graceful handling of missing data

```typescript
try {
  // Database operation
} catch (error) {
  console.error("Error fetching categories at [getAllCategories]: ", error);
  throw error;
}
```

### Naming Conventions
- Service files: `PascalCase` (e.g., `CategoryService.ts`, `ProductService.ts`)
- Service objects: `camelCase` with "Service" suffix (e.g., `categoryService`, `productService`)
- Methods: `camelCase` describing the operation (e.g., `getAllCategories`, `getProductById`)

## Hooks Layer

### Location
All hooks are located in `src/hooks/` directory.

### Structure
Hooks use React Query (`@tanstack/react-query`) to provide data fetching with built-in caching, loading states, and error handling.

```typescript
// src/hooks/useCategories.ts
export function useGetAllCategories() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### Responsibilities

#### Data Fetching
- Call service methods within `queryFn`
- Handle different query types (`useQuery`, `useInfiniteQuery`)
- Configure query options for optimal performance

#### Caching Strategy
- `staleTime`: How long data remains fresh
- `gcTime`: How long data stays in cache
- `retry`: Automatic retry on failure
- `enabled`: Conditional fetching

#### Pagination
- `useInfiniteQuery` for infinite scrolling
- `getNextPageParam`: Logic for next page determination
- `initialPageParam`: Starting pagination state

```typescript
// Infinite scrolling example
export function useInfiniteProductsByCategory(categoryId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.byCategoryInfinite(categoryId),
    queryFn: ({ pageParam }) =>
      productService.getProductsByCategory(categoryId, PRODUCTS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage) => lastPage.lastDoc ?? undefined,
    initialPageParam: undefined,
  });
}
```

### Naming Conventions
- Hook files: `camelCase` with "use" prefix (e.g., `useCategories.ts`, `useProducts.ts`)
- Hook functions: `camelCase` with "use" prefix, describing the operation (e.g., `useGetAllCategories`, `useProductById`)

## Query Keys Management

### Location
Query keys are centralized in `src/lib/react-query.ts`.

### Structure
Query keys follow a hierarchical structure for efficient cache invalidation:

```typescript
export const queryKeys = {
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (filters?: { withSubCategories?: boolean }) =>
      [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  // ... other domains
};
```

### Best Practices
1. **Hierarchical Structure**: `[domain, entity, ...details]`
2. **Invalidation**: More general keys invalidate specific ones
3. **Dynamic Keys**: Use functions for parameterized queries
4. **Consistency**: Maintain consistent ordering across similar queries

## Data Flow

```
Component → Hook → Service → Firestore
    ↑         ↑       ↑
    ←──────── ←────── ←────── (Data/Error)
```

1. **Component** calls a hook
2. **Hook** uses React Query to manage the request
3. **Service** performs the actual database operation
4. Data flows back through the layers with proper error handling

## Benefits

### Separation of Concerns
- Services handle business logic independently of React
- Hooks manage React-specific concerns (state, effects, caching)
- Clear boundaries make code easier to test and maintain

### Testability
- Services can be unit tested without React dependencies
- Hooks can be tested with React Testing Library
- Pure functions are easier to mock and verify

### Reusability
- Services can be used in different contexts (hooks, components, utilities)
- Hooks encapsulate common data fetching patterns
- Query keys enable consistent cache management

### Performance
- React Query provides intelligent caching and background updates
- Configurable stale times reduce unnecessary requests
- Infinite queries optimize large dataset handling

## Implementation Examples

### Basic CRUD Service
```typescript
// src/services/ProductService.ts
export const productService = {
  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return firestoreToProduct(docSnap.id, data);
  },

  async getProductsByCategory(
    categoryId: string,
    pageLimit: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
    // Implementation with pagination
  },
};
```

### Corresponding Hook
```typescript
// src/hooks/useProducts.ts
export function useProductById(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useInfiniteProductsByCategory(categoryId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.byCategoryInfinite(categoryId),
    queryFn: ({ pageParam }) =>
      productService.getProductsByCategory(categoryId, PRODUCTS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage) => lastPage.lastDoc ?? undefined,
    initialPageParam: undefined,
    enabled: !!categoryId,
  });
}
```

### Usage in Component
```typescript
// src/components/ProductList.tsx
function ProductList({ categoryId }: { categoryId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
  } = useInfiniteProductsByCategory(categoryId);

  // Component logic
}
```

## Best Practices

### Services
1. Keep services pure and stateless
2. Use consistent error handling patterns
3. Document complex business logic
4. Avoid React-specific code
5. Use TypeScript interfaces for data shapes

### Hooks
1. Configure appropriate cache times based on data volatility
2. Use `enabled` prop for conditional fetching
3. Handle loading and error states appropriately
4. Use descriptive hook names
5. Keep hooks focused on single responsibilities

### General
1. Follow consistent naming conventions
2. Write comprehensive TypeScript types
3. Add JSDoc comments for complex operations
4. Keep related code co-located
5. Test both services and hooks independently