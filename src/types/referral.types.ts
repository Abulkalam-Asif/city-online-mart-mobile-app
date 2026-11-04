/**
 * Referrals (B-063). Rules: admin/docs/business-rules/coupons.md.
 * A new customer applies the referral code of an existing customer; when the new customer's first order
 * is delivered, the inviter earns a coupon (see the admin's OrderService.deliverOrder).
 */
export type ReferralStatus = "invited" | "successful" | "void";

export interface Referral {
  /** The invitee's uid. */
  id: string;
  inviteeId: string;
  inviterId: string;
  inviterName: string;
  inviteePhone?: string;
  code: string;
  status: ReferralStatus;
  createdAt: Date;
  successfulAt?: Date;
  rewardCouponCode?: string;
}
