// Legacy types for backward compatibility with temp data
// These will be removed once all components are migrated to use the new Product type

export interface IProduct {
  Id: string;
  Name: string;
  MainImageUrl?: any;
  ThumbnailUrl?: any;
  Price: number;
  OldPrice?: number;
}

export interface IProductImage {
  Id: number;
  ImageUrl: any;
  DisplayOrder: number;
}

export interface IProductDetails {
  Id: number;
  Name: string;
  ManufacturerName: string;
  FullDescription: string;
  ApprovedRatingSum: number;
  ApprovedTotalReviews: number;
  DisplayOrder: number;
  Price: number;
  OldPrice?: number;
  DisableBuyButton: boolean;
  DisableWishlistButton: boolean;
  HasDiscounts: boolean;
  Discounts: any[];
  Images: IProductImage[];
  StockInfo: {
    InStock: boolean;
    StockQuantity: number;
    StockAvailability: string;
    ManageInventoryMethod: number;
    ManageInventoryMethodName: string;
  };
  MinimumQuantity: number;
  MaximumQuantity: number;
  AllowedQuantities: any;
  RelatedProducts: IProduct[];
}

export interface ICategory {
  Id: number;
  Name: string;
  // Add other properties as needed
}
