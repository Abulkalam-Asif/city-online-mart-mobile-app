// Product Information Section
export interface ProductInfo {
  name: string;
  nameLowerCase?: string; // Renamed from nameLower - lowercase version for case-insensitive search
  searchArr?: string[]; // Renamed from words - array of individual words for enhanced search
  description: string;

  // Category Assignment (NEW STRUCTURE)
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