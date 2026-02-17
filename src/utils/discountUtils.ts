import { Discount } from "../types";


export const getBestOrderDiscount = (validOrderDiscounts: Discount[], itemsSubtotal: number) => {
  let bestOrderDiscount: Discount | null = null;
  for (const d of validOrderDiscounts) {
    if (itemsSubtotal >= (d.minPurchaseAmount || 0)) {
      if (!bestOrderDiscount || d.percentage > bestOrderDiscount.percentage) {
        bestOrderDiscount = d;
      }
    }
  }
  return bestOrderDiscount;
}