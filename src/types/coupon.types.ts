/**
 * Coupons (B-063). Mirror of the admin's `src/types/coupon.types.ts`; keep the two in step.
 * Rules: admin `docs/business-rules/coupons.md`.
 * - "general": any customer types the code at checkout, once per account.
 * - "referral": earned by the inviter when an invited customer's first order is delivered.
 */
export type CouponType = "general" | "referral";

/** A coupon definition (admin creates it). The document id is the lower-case code. */
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  percentage: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  validForDays?: number;
}

/** The coupon terms an order keeps (a snapshot, so later changes to the coupon never move the order). */
export interface AppliedCoupon {
  couponId: string;
  code: string;
  type: CouponType;
  /** The customer's coupon record used for this order (see CustomerCoupon.id). */
  customerCouponId: string;
  percentage: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  /** The Rs taken off this order. */
  amount: number;
}

export type CustomerCouponStatus = "available" | "used" | "void";

/**
 * A coupon of one customer: an earned or granted coupon waiting to be used, or the record of a used
 * coupon. A general coupon's id is `{couponId}_{customerId}`.
 */
export interface CustomerCoupon {
  id: string;
  customerId: string;
  couponId: string;
  code: string;
  type: CouponType;
  source: "general" | "referral_reward" | "admin_grant";
  status: CustomerCouponStatus;
  percentage: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: Date;
  orderId?: string;
  amountSaved?: number;
  usedAt?: Date;
  createdAt: Date;
}
