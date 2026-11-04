import {
  collection,
  getDocs,
  query,
  where,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import type { CustomerCoupon } from "../types/coupon.types";
import { convertTimestamp } from "../utils/firestoreUtils";
import { logger } from "../utils/logger";
import { resolveCouponForOrder, CUSTOMER_COUPONS_COLLECTION, type ResolvedCoupon } from "./couponRedemption";

/**
 * The signed-in customer's coupons (B-063): checking a typed code at checkout, and the Coupons menu
 * (available coupons and the history of used ones). Placing the order and marking the coupon used
 * happen inside `OrderService.createOrder`.
 */
export class CouponService {
  constructor(private db: FirebaseFirestoreTypes.Module) { }

  /** Checks a typed code for this customer. Throws an Error with the reason when it cannot be used. */
  async checkCode(code: string, customerId: string): Promise<ResolvedCoupon> {
    return resolveCouponForOrder(this.db, code, customerId);
  }

  /**
   * All coupon records of the customer, newest first: available (earned or granted), used and void.
   * Customers have only a handful, so there is no paging.
   */
  async getMyCoupons(customerId: string): Promise<CustomerCoupon[]> {
    try {
      const snap = await getDocs(
        query(collection(this.db, CUSTOMER_COUPONS_COLLECTION), where("customerId", "==", customerId))
      );
      return snap.docs
        .map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot): CustomerCoupon => {
          const data = d.data();
          return {
            id: d.id,
            customerId: data.customerId,
            couponId: data.couponId,
            code: data.code,
            type: data.type === "referral" ? "referral" : "general",
            source: data.source,
            status: data.status,
            percentage: data.percentage,
            minPurchaseAmount: data.minPurchaseAmount || undefined,
            maxDiscountAmount: data.maxDiscountAmount || undefined,
            expiresAt: data.expiresAt ? convertTimestamp(data.expiresAt) : undefined,
            orderId: data.orderId,
            amountSaved: data.amountSaved,
            usedAt: data.usedAt ? convertTimestamp(data.usedAt) : undefined,
            createdAt: convertTimestamp(data.createdAt),
          };
        })
        .sort((a: CustomerCoupon, b: CustomerCoupon) => (b.usedAt ?? b.createdAt).getTime() - (a.usedAt ?? a.createdAt).getTime());
    } catch (error) {
      logger.error("Error fetching coupons:", error);
      throw error;
    }
  }
}
