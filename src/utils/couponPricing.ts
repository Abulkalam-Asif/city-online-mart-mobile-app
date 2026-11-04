import type { AppliedCoupon, Coupon } from "../types/coupon.types";

/**
 * Coupon pricing (B-063). Copy of the admin's `src/utils/couponPricing.ts`; keep the two in step.
 * Rules: admin `docs/business-rules/coupons.md`.
 *
 * A coupon is the last discount on an order. Its percentage and its minimum are measured on the same
 * figure the online payment discount uses (items after product discounts minus the order discount, no
 * delivery fee), so switching the payment method never moves the coupon:
 * `total = base - online discount - coupon + delivery fee`.
 */

type CouponTerms = Pick<Coupon, "percentage" | "minPurchaseAmount" | "maxDiscountAmount">;

/** Codes are not case-sensitive: the document id of a coupon is the lower-case code. */
export const normalizeCouponCode = (code: string) => code.trim().toLowerCase();

export const getCouponBase = (subtotal: number, orderDiscountAmount = 0) => subtotal - orderDiscountAmount;

/**
 * The Rs a coupon takes off. Rounded like the other discounts, never above the maximum (when set),
 * never below 0, and never more than what is left of the base after the online discount.
 */
export const calculateCouponAmount = (base: number, terms: CouponTerms, onlineDiscountAmount = 0): number => {
  const percentageAmount = Math.round((base * terms.percentage) / 100);
  const capped = terms.maxDiscountAmount && terms.maxDiscountAmount > 0
    ? Math.min(percentageAmount, terms.maxDiscountAmount)
    : percentageAmount;
  return Math.max(0, Math.min(capped, base - onlineDiscountAmount));
};

export const getCouponMinimumError = (base: number, terms: Pick<Coupon, "minPurchaseAmount">): string | null => {
  const min = terms.minPurchaseAmount || 0;
  if (min <= 0 || base >= min) return null;
  return `This coupon needs an order of at least Rs. ${min.toLocaleString("en-US")} (yours is Rs. ${base.toLocaleString("en-US")}).`;
};

export const getCouponValidityError = (
  coupon: Pick<Coupon, "isActive" | "startDate" | "endDate">,
  now: Date = new Date()
): string | null => {
  if (!coupon.isActive) return "This coupon is not active.";
  if (now < coupon.startDate) return "This coupon has not started yet.";
  if (now > coupon.endDate) return "This coupon has expired.";
  return null;
};

export const buildAppliedCoupon = (
  coupon: Pick<Coupon, "id" | "code" | "type" | "percentage" | "minPurchaseAmount" | "maxDiscountAmount">,
  amount: number,
  customerCouponId: string
): AppliedCoupon => ({
  couponId: coupon.id,
  code: coupon.code,
  type: coupon.type,
  customerCouponId,
  percentage: coupon.percentage,
  // Firestore refuses undefined, so unset terms are left out
  ...(coupon.minPurchaseAmount ? { minPurchaseAmount: coupon.minPurchaseAmount } : {}),
  ...(coupon.maxDiscountAmount ? { maxDiscountAmount: coupon.maxDiscountAmount } : {}),
  amount,
});
