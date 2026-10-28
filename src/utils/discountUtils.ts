import { Product } from "../types";

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
