import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import type { Coupon, CouponType } from "../types/coupon.types";
import { convertTimestamp } from "../utils/firestoreUtils";
import { getCouponValidityError, normalizeCouponCode } from "../utils/couponPricing";

/**
 * Finding and using a coupon when an order is placed (B-063). Copy of the admin's
 * `src/services/couponRedemption.ts` for React Native Firebase; keep the two in step.
 * Rules: admin `docs/business-rules/coupons.md`.
 *
 * A typed code is resolved in this order:
 *  1. a coupon the customer holds (earned referral reward or admin grant) that is still available;
 *  2. otherwise, a general coupon definition: usable once per account.
 * A referral coupon the customer does not hold is refused.
 */

export const COUPONS_COLLECTION = "COUPONS";
export const CUSTOMER_COUPONS_COLLECTION = "CUSTOMER_COUPONS";

export interface ResolvedCoupon {
  /** "held": use an available CUSTOMER_COUPONS record. "general": create the used record of a general coupon. */
  mode: "held" | "general";
  customerCouponId: string;
  coupon: Pick<Coupon, "id" | "code" | "type" | "percentage" | "minPurchaseAmount" | "maxDiscountAmount">;
}

type Db = FirebaseFirestoreTypes.Module;

export async function resolveCouponForOrder(
  db: Db,
  code: string,
  customerId: string,
  now: Date = new Date()
): Promise<ResolvedCoupon> {
  const couponId = normalizeCouponCode(code);
  if (!couponId) throw new Error("Enter a coupon code");

  // 1. A coupon the customer holds: the one that expires first
  const heldSnap = await getDocs(
    query(
      collection(db, CUSTOMER_COUPONS_COLLECTION),
      where("customerId", "==", customerId),
      where("couponId", "==", couponId),
      where("status", "==", "available")
    )
  );
  const held = heldSnap.docs
    .map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: d.id, data: d.data() }))
    .filter(({ data }: { data: FirebaseFirestoreTypes.DocumentData }) => !data.expiresAt || convertTimestamp(data.expiresAt) >= now)
    .sort(
      (a: { data: FirebaseFirestoreTypes.DocumentData }, b: { data: FirebaseFirestoreTypes.DocumentData }) =>
        (a.data.expiresAt ? convertTimestamp(a.data.expiresAt).getTime() : Infinity) -
        (b.data.expiresAt ? convertTimestamp(b.data.expiresAt).getTime() : Infinity)
    )[0];
  if (held) {
    return {
      mode: "held",
      customerCouponId: held.id,
      coupon: {
        id: couponId,
        code: held.data.code,
        type: held.data.type as CouponType,
        percentage: held.data.percentage,
        minPurchaseAmount: held.data.minPurchaseAmount || undefined,
        maxDiscountAmount: held.data.maxDiscountAmount || undefined,
      },
    };
  }

  // 2. A general coupon anyone can type, once per account
  const snap = await getDoc(doc(db, COUPONS_COLLECTION, couponId));
  if (!snap.exists()) throw new Error(`Coupon "${code.trim()}" was not found`);
  const data = snap.data()!;
  if (data.type === "referral") throw new Error(`You don't have the coupon "${data.code}"`);

  const validityError = getCouponValidityError(
    {
      isActive: data.isActive !== false,
      startDate: convertTimestamp(data.startDate),
      endDate: convertTimestamp(data.endDate),
    },
    now
  );
  if (validityError) throw new Error(validityError);

  const customerCouponId = `${couponId}_${customerId}`;
  const used = await getDoc(doc(db, CUSTOMER_COUPONS_COLLECTION, customerCouponId));
  if (used.exists()) throw new Error(`You have already used the coupon "${data.code}"`);

  return {
    mode: "general",
    customerCouponId,
    coupon: {
      id: couponId,
      code: data.code,
      type: "general",
      percentage: data.percentage,
      minPurchaseAmount: data.minPurchaseAmount || undefined,
      maxDiscountAmount: data.maxDiscountAmount || undefined,
    },
  };
}

/**
 * First half, inside the order transaction (reads must come before writes): make sure the coupon is
 * still free. Two orders placed at once with the same coupon cannot both pass.
 */
export async function readCouponUse(
  transaction: FirebaseFirestoreTypes.Transaction,
  db: Db,
  resolved: ResolvedCoupon
): Promise<FirebaseFirestoreTypes.DocumentReference> {
  const ref = doc(db, CUSTOMER_COUPONS_COLLECTION, resolved.customerCouponId);
  const snap = await transaction.get(ref);
  if (resolved.mode === "general" && snap.exists()) {
    throw new Error(`You have already used the coupon "${resolved.coupon.code}"`);
  }
  if (resolved.mode === "held" && (!snap.exists() || snap.data()?.status !== "available")) {
    throw new Error(`The coupon "${resolved.coupon.code}" is no longer available`);
  }
  return ref;
}

/** Second half: mark the coupon used by this order. It is never given back (cancel, refund). */
export function writeCouponUse(
  transaction: FirebaseFirestoreTypes.Transaction,
  ref: FirebaseFirestoreTypes.DocumentReference,
  resolved: ResolvedCoupon,
  use: { customerId: string; orderId: string; amount: number }
): void {
  const now = Timestamp.now();
  if (resolved.mode === "held") {
    transaction.update(ref, { status: "used", orderId: use.orderId, amountSaved: use.amount, usedAt: now });
    return;
  }
  const { coupon } = resolved;
  transaction.set(ref, {
    customerId: use.customerId,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    source: "general",
    status: "used",
    percentage: coupon.percentage,
    ...(coupon.minPurchaseAmount ? { minPurchaseAmount: coupon.minPurchaseAmount } : {}),
    ...(coupon.maxDiscountAmount ? { maxDiscountAmount: coupon.maxDiscountAmount } : {}),
    orderId: use.orderId,
    amountSaved: use.amount,
    usedAt: now,
    createdAt: now,
  });
}
