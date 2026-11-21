import type { Order, OrderRefundEntry, OrderRefundItem } from "../types";

/**
 * Refund figures for the customer screens (receipt, Order Details, Order History).
 * Only active refunds count: a voided refund is never shown. The reason is not in the order copy.
 * Same rules as the admin receipt (`AdminPrintReceipt.tsx`).
 */
export interface OrderRefundSummary {
  /** Active (not voided) refunds, oldest first as stored. */
  activeRefunds: OrderRefundEntry[];
  /** Items of all active refunds, one line per refunded item. */
  refundedItems: OrderRefundItem[];
  /** Active refunds without a breakdown (older data): shown as one amount line each. */
  refundsWithoutDetails: OrderRefundEntry[];
  deliveryFeeRefunded: number;
  /** Delivery fee the admin charged by hand (B-074). */
  deliveryFeeCharged: number;
  orderDiscountRecovered: number;
  onlineDiscountRecovered: number;
  couponDiscountRecovered: number;
  customAdjustment: number;
  /** Net of the active refunds. Below 0 when the admin charged more than was refunded (extra charge). */
  totalRefunded: number;
  /** What the customer owes now: order total minus total refunded (higher than the total after an extra charge), never below 0. */
  adjustedTotal: number;
  isFullyRefunded: boolean;
  /** True when the net is below 0: the customer owes extra money. Shown as "Extra Charge", not "Refunded". */
  isExtraCharge: boolean;
}

/** Rounds to paisa, so sums of item prices like 114.333 don't show long decimals. */
export const roundAmount = (amount: number) => Math.round(amount * 100) / 100;

export const isActiveRefund = (refund: OrderRefundEntry) => refund.status !== "voided";

/** Null when the order has no active refund, so callers show nothing. */
export const getOrderRefundSummary = (order: Pick<Order, "total" | "refunds" | "totalRefunded">): OrderRefundSummary | null => {
  const activeRefunds = (order.refunds ?? []).filter(isActiveRefund);
  const sumOf = (pick: (r: OrderRefundEntry) => number | undefined) =>
    roundAmount(activeRefunds.reduce((sum, r) => sum + (pick(r) || 0), 0));

  // order.totalRefunded is kept by the admin in the same transaction (net of voided refunds)
  const totalRefunded = roundAmount(order.totalRefunded ?? sumOf((r) => r.amount));
  // A net of 0 or below still shows: refunds and extra charges can cancel each other out (B-074)
  if (activeRefunds.length === 0) return null;

  return {
    activeRefunds,
    refundedItems: activeRefunds.flatMap((r) => r.refundedItems ?? []),
    refundsWithoutDetails: activeRefunds.filter((r) => !r.refundedItems),
    deliveryFeeRefunded: sumOf((r) => r.deliveryFeeRefunded),
    deliveryFeeCharged: sumOf((r) => r.deliveryFeeCharged),
    orderDiscountRecovered: sumOf((r) => r.orderDiscountRecovered),
    onlineDiscountRecovered: sumOf((r) => r.onlineDiscountRecovered),
    couponDiscountRecovered: sumOf((r) => r.couponDiscountRecovered),
    customAdjustment: sumOf((r) => r.customAdjustment),
    totalRefunded,
    adjustedTotal: roundAmount(Math.max(0, order.total - totalRefunded)),
    isFullyRefunded: order.total > 0 && totalRefunded >= order.total,
    isExtraCharge: totalRefunded < 0,
  };
};

/** Refunded quantity per product id, over active refunds. */
export const getRefundedQuantities = (order: Pick<Order, "refunds">): Record<string, number> => {
  const quantities: Record<string, number> = {};
  for (const refund of (order.refunds ?? []).filter(isActiveRefund)) {
    for (const item of refund.refundedItems ?? []) {
      quantities[item.productId] = (quantities[item.productId] || 0) + item.quantity;
    }
  }
  return quantities;
};

/** Tag for an order item: "Refunded", "2 of 3 refunded", or null when nothing was refunded. */
export const getItemRefundLabel = (orderedQuantity: number, refundedQuantity: number): string | null => {
  if (refundedQuantity <= 0) return null;
  if (refundedQuantity >= orderedQuantity) return "Refunded";
  return `${refundedQuantity} of ${orderedQuantity} refunded`;
};
