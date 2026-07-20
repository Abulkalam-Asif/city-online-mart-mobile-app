export interface DeliverySlot {
  id: string;
  name: string;
  startTime: string; // e.g. "11:00"
  endTime: string; // e.g. "15:00"
  limit: number;
  currentOrders: number;
}

export interface DailyDeliverySlotDoc {
  id: string; // "YYYY-MM-DD"
  date: string; // "YYYY-MM-DD"
  slots: DeliverySlot[];
}

export interface DeliverySlotTemplate {
  defaultSlots: Omit<DeliverySlot, "currentOrders">[];
}
