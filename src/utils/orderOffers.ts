import type { Discount, Order } from "../types";

/**
 * Order-level offers: a percentage discount or free delivery (both are discounts of type "order").
 * Rules: admin docs/business-rules/orders.md 1.1 and 1.3. This is a copy of the admin's
 * `src/utils/orderOffers.ts` (pickOrderOffer, resolveDeliveryFee); keep the two in step.
 * `getNextOfferHint` only exists here (the cart hint).
 */

export type OrderOffer =
  | { kind: "percentage"; discount: Discount }
  | { kind: "free_delivery"; discount: Discount };

/** A missing benefitType (a discount from before the field existed) counts as a percentage discount. */
export const isFreeDeliveryDiscount = (discount: Pick<Discount, "benefitType">) =>
  discount.benefitType === "free_delivery";

/**
 * The one order-level offer that applies, or null.
 *
 * - `runningSubtotal`: items after product discounts, before any order-level discount, without delivery.
 * - Percentage candidate: the highest percentage among the qualifying percentage discounts.
 * - Free delivery candidate: standard delivery only, minimum above 0; the qualifying one with the
 *   biggest minimum (they all give the same benefit).
 * - Both exist: the bigger `minPurchaseAmount` wins; on a tie the percentage discount wins.
 */
export const pickOrderOffer = (
  offers: Discount[],
  runningSubtotal: number,
  { isExpress }: { isExpress: boolean }
): OrderOffer | null => {
  let percentage: Discount | null = null;
  let freeDelivery: Discount | null = null;

  for (const d of offers) {
    const min = d.minPurchaseAmount || 0;
    if (runningSubtotal < min) continue;

    if (isFreeDeliveryDiscount(d)) {
      if (isExpress || min <= 0) continue;
      if (!freeDelivery || min > (freeDelivery.minPurchaseAmount || 0)) freeDelivery = d;
    } else if (!percentage || d.percentage > percentage.percentage) {
      percentage = d;
    }
  }

  if (percentage && freeDelivery) {
    const freeDeliveryWins = (freeDelivery.minPurchaseAmount || 0) > (percentage.minPurchaseAmount || 0);
    return freeDeliveryWins
      ? { kind: "free_delivery", discount: freeDelivery }
      : { kind: "percentage", discount: percentage };
  }
  if (freeDelivery) return { kind: "free_delivery", discount: freeDelivery };
  if (percentage) return { kind: "percentage", discount: percentage };
  return null;
};

/**
 * The delivery fee for an order, and the free delivery snapshot to store on it when the fee was waived.
 * Express is never waived.
 */
export const resolveDeliveryFee = (
  offer: OrderOffer | null,
  { isExpress, standardFee, expressFee }: { isExpress: boolean; standardFee: number; expressFee: number }
): { deliveryFee: number; appliedFreeDelivery?: Order["appliedFreeDelivery"] } => {
  if (isExpress) return { deliveryFee: expressFee };
  if (offer?.kind !== "free_delivery") return { deliveryFee: standardFee };

  return {
    deliveryFee: 0,
    appliedFreeDelivery: {
      id: offer.discount.id,
      name: offer.discount.name,
      minPurchaseAmount: offer.discount.minPurchaseAmount || 0,
      waivedAmount: standardFee,
    },
  };
};

/** The cart starts hinting at an offer once the items reach this share of its minimum purchase. */
export const OFFER_HINT_RATIO = 0.8;

export type OfferHint = { kind: "percentage"; percentage: number; remaining: number } | { kind: "free_delivery"; remaining: number };

/**
 * The next offer to hint at, among the offers that are not reached yet: the one with the lowest minimum,
 * but only when the items are already at OFFER_HINT_RATIO of that minimum. `remaining` is how much more
 * it takes to reach it.
 *
 * - A percentage discount is a candidate only if its percentage is higher than the one applied now.
 * - Free delivery is a candidate only for a standard slot and only when no offer applies yet: it would
 *   replace an applied percentage discount (bigger minimum wins), so the cart does not push it then.
 */
export const getNextOfferHint = (
  offers: Discount[],
  runningSubtotal: number,
  applied: OrderOffer | null,
  { isExpress }: { isExpress: boolean }
): OfferHint | null => {
  const appliedPercentage = applied?.kind === "percentage" ? applied.discount.percentage : 0;
  let next: Discount | null = null;

  for (const d of offers) {
    const min = d.minPurchaseAmount || 0;
    if (min <= runningSubtotal) continue;

    if (isFreeDeliveryDiscount(d)) {
      if (isExpress || applied !== null) continue;
    } else if (d.percentage <= appliedPercentage) {
      continue;
    }
    if (!next || min < (next.minPurchaseAmount || 0)) next = d;
  }

  const min = next?.minPurchaseAmount || 0;
  if (!next || runningSubtotal < min * OFFER_HINT_RATIO) return null;
  const remaining = min - runningSubtotal;
  return isFreeDeliveryDiscount(next)
    ? { kind: "free_delivery", remaining }
    : { kind: "percentage", percentage: next.percentage, remaining };
};
