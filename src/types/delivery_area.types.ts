/**
 * Delivery areas (B-072): the places the city delivers to. Copy of the admin's
 * `admin/src/types/delivery_area.types.ts`; keep the two in sync.
 *
 * A city with no ACTIVE area has the check switched off: the checkout shows no area picker.
 */
export interface DeliveryArea {
  id: string;
  /** What the customer sees and picks, e.g. "Chak 130/15-L". */
  name: string;
  /** Other ways of writing the area (lower case); used only by the picker's search box. */
  keywords: string[];
  isActive: boolean;
}

/** The area the customer chose, as stored on an order and on the customer's profile. */
export interface OrderDeliveryArea {
  id: string;
  /** The name at the time of the order. */
  name: string;
}
