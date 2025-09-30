export interface IProduct {
  Id: number;
  Name: string;
  Price: number;
  ShortDescription?: string;
  OldPrice?: number;
  MainImageUrl?: string;
  ThumbnailUrl?: string;
  InStock?: boolean;
  StockAvailability?: string;
  HasDiscounts?: boolean;
  CreatedOnUtc?: string;
  UpdatedOnUtc?: string;
}

export interface IProductImage {
  Id: number;
  ImageUrl: string;
  ThumbnailUrl?: string;
  AltText?: string | null;
  Title?: string | null;
  DisplayOrder: number;
}

export interface IProductStockInfo {
  InStock: boolean;
  StockQuantity: number;
  StockAvailability: string;

  ManageInventoryMethod: number;
  ManageInventoryMethodName: string;
}

// Detailed product info extending the basic interface
export interface IProductDetails extends IProduct {
  FullDescription: string;
  ManufacturerName: string;
  ApprovedRatingSum: number;
  ApprovedTotalReviews: number;
  DisplayOrder: number;
  Discounts: any[];
  RelatedProducts: IProduct[];
  CrossSellProducts: IProduct[];
  Manufacturers: any[];
  IsNew: boolean;
  DisableBuyButton: boolean;
  StockInfo: IProductStockInfo;
  MinimumQuantity: number;
  MaximumQuantity: number;
  AllowedQuantities: number[] | null;
  DisableWishlistButton: boolean;
  Images: IProductImage[];
}
