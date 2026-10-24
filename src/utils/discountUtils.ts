import { Discount, Product } from "../types";

type ProductDiscount = Product["validApplicableDiscounts"][0];

/** The product discount with the highest percentage (the one the product cards apply). */
export const getBestProductDiscount = (discounts: Product["validApplicableDiscounts"]) =>
  discounts.reduce(
    (best, current) => (current.percentage > (best?.percentage || 0) ? current : best),
    null as ProductDiscount | null
  );

/**
 * Unit price after a product discount. The discount per unit is rounded to the rupee and then
 * subtracted, exactly like `OrderService.calculateOrderPricing` (app and admin), so what the
 * customer sees is what the order charges. Rounding the final price instead differs by Rs. 1
 * whenever the discount ends in .5 (Rs. 100 at 4.5%: 96 against 95).
 */
export const getDiscountedPrice = (price: number, percentage: number) =>
  price - Math.round((price * percentage) / 100);


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

/** The cart starts hinting at an order discount once the items reach this share of its minimum purchase. */
export const ORDER_DISCOUNT_HINT_RATIO = 0.8;

/**
 * The next order discount to hint at: among the discounts with a higher percentage than the one
 * applied now, the one with the lowest minimum purchase, but only when the items subtotal is already
 * at ORDER_DISCOUNT_HINT_RATIO of that minimum. `remaining` is how much more it takes to reach it.
 */
export const getNextOrderDiscountHint = (
  validOrderDiscounts: Discount[],
  itemsSubtotal: number,
  appliedPercentage: number
) => {
  let next: Discount | null = null;
  for (const d of validOrderDiscounts) {
    const min = d.minPurchaseAmount || 0;
    if (d.percentage <= appliedPercentage || min <= itemsSubtotal) continue;
    if (!next || min < (next.minPurchaseAmount || 0)) next = d;
  }
  const min = next?.minPurchaseAmount || 0;
  if (!next || itemsSubtotal < min * ORDER_DISCOUNT_HINT_RATIO) return null;
  return { percentage: next.percentage, remaining: min - itemsSubtotal };
};