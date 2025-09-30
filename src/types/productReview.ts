export interface IProductReview {
  ProductId: number;
  ProductName: string;
  TotalReviews: number;
  AverageRating: number;
  Reviews: IReview[];
}

export interface IReview {
  Id: number;
  ProductId: number;
  CustomerId: number;
  CustomerName: string;
  Title: string;
  ReviewText: string;
  ReplyText: string;
  Rating: number;
  IsApproved: boolean;
  HelpfulYesTotal: number;
  HelpfulNoTotal: number;
  CreatedOnUtc: string;
}
