export type ProductSortType = "default" | "price-asc" | "price-desc"

export type StockStatus = "In Stock" | "Out of Stock" | "Low Stock";

// Discount information cached in products (only valid discounts)
export interface ProductDiscount {
  id: string;        // Discount document ID
  percentage: number; // Discount percentage (0-100, max 2 decimals)
  source: "product" | "category" | "sub-category" | "special-category";
}

// Product Information Section
export interface ProductInfo {
  name: string;
  nameLowerCase?: string; // lowercase version for case-insensitive search
  searchArr?: string[]; // array of individual words for enhanced search
  description: string;

  // Category Assignment
  subCategoryId?: string; // Single subcategory ID (optional) - primary classification
  specialCategoryIds?: string[]; // Array of special category IDs (optional) - cross-listing
  // Products can have BOTH subCategoryId AND specialCategoryIds
  // At least ONE must be assigned (validated in service layer)

  manufacturerId?: string; // Optional reference to manufacturer ID
  isActive: boolean;
  productTags: string[];
  allowCustomerReviews: boolean;
  markAsNew: boolean;
  markAsNewStartDate?: Date;
  markAsNewEndDate?: Date;
}

// Multimedia Section
export interface ProductMultimedia {
  images: string[];
  video: string;
}

export interface Product {
  id: string;

  // Product Information Section
  info: ProductInfo;

  // Pricing
  price: number; // Current selling price set directly on the product

  // Discounts Section
  discountId?: string; // Single discount ID that can be applied directly to the product
  validApplicableDiscounts: ProductDiscount[]; // Cache of all valid discounts (active && not expired)
  discountSources: string[]; // Discount IDs for efficient querying (mirrors validApplicableDiscounts IDs)

  // Inventory Section
  minimumStockQuantity: number;

  // Multimedia Section
  multimedia: ProductMultimedia;

  // Related Products Section
  boughtTogetherProductIds: string[]; // Manually curated "frequently bought together" products

  // Batch Stock Data (calculated from batches)
  batchStock?: {
    usableStock: number; // Non-expired stock
    expiredStock: number; // Expired stock
  };
}
