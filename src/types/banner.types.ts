export interface Banner {
  id: string;
  title?: string; // Optional
  imageUrl: string;
  bannerType: "popup" | "homepage";
  linkType: "category" | "product";
  link: string; // Could be categoryId or productId based on linkType
  isActive: boolean;
  displayOrder: number;
  timerSeconds?: number | null;
}

export type BannerMinimal = Pick<Banner, "id" | "imageUrl" | "linkType" | "link" | "displayOrder" | "timerSeconds">;
