import type { AuditActor, AuditFieldChange, AuditTarget } from "../types/audit.types";

/** The order fields every order entry needs for its actor, target and search references. */
interface OrderIdentity {
  customerId: string;
  customerName?: string;
  customerPhone?: string;
}

/** The customer is the actor of every entry the app writes; role is always "user". */
export function customerActor(order: OrderIdentity): AuditActor {
  return { uid: order.customerId, name: order.customerName || order.customerPhone || order.customerId, role: "user" };
}

export function orderAuditTarget(orderId: string): AuditTarget {
  return { type: "order", id: orderId, label: `#${orderId}` };
}

/** "type:id" values the admin Activity Logs page searches by (order, customer and phone). */
export function orderAuditRefs(orderId: string, order: OrderIdentity): string[] {
  const refs = [`order:${orderId}`, `customer:${order.customerId}`];
  if (order.customerPhone) refs.push(`phone:${order.customerPhone}`);
  return refs;
}

export function fieldChange(from: unknown, to: unknown): AuditFieldChange {
  return { from: from ?? null, to: to ?? null };
}

/** Items reduced to what a reader needs; the full order item carries prices, discounts and more. */
export function summariseItems(
  items: { productId: string; productName?: string; quantity: number }[] | undefined,
): { productId: string; productName: string; quantity: number }[] {
  return (items ?? []).map((i) => ({
    productId: i.productId,
    productName: i.productName ?? i.productId,
    quantity: i.quantity,
  }));
}
