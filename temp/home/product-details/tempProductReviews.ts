import { IProductReview } from "@/src/types/productReview";

export const tempProductReviews: IProductReview = {
  ProductId: 1,
  ProductName: "Build your own computer",
  TotalReviews: 1,
  AverageRating: 4,
  Reviews: [
    {
      Id: 1,
      ProductId: 1,
      CustomerId: 1,
      CustomerName: "John Smith",
      Title: "Some sample review",
      ReviewText:
        "This sample review is for the Build your own computer. I've been waiting for this product to be available. It is priced just right.",
      ReplyText: "",
      Rating: 4,
      IsApproved: true,
      HelpfulYesTotal: 0,
      HelpfulNoTotal: 0,
      CreatedOnUtc: "2025-09-28T11:25:48.686925",
    },
  ],
};
