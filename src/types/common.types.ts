export interface PaginatedResult<T> {
  items: T[]; // Array of items for current page
  hasMore: boolean; // Whether there are more items to load
  lastDocId?: string; // Last document ID for next page cursor
}