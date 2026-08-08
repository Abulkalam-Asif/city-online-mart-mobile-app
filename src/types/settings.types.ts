export interface AuthSettings {
  requireOTP: boolean;
}

export interface OrderSettings {
  deliveryFee: number;
  cancellationTimeLimitMinutes: number;
  minimumOrderAmount: number;
  maxCartQuantityPerProduct: number;
  onlinePaymentDiscountPercentage: number;
}

export interface DeliverySettings {
  cutoffTimeMinutes: number;
  mobileDisplayDays?: number;
  expressDeliveryEnabled: boolean;
  expressDeliveryDurationMinutes: number;
  expressDeliveryFee: number;
  expressDeliveryTitle?: string;
  expressDeliveryStartTime?: string;
  expressDeliveryEndTime?: string;
  expressDeliveryBadgeText: string;
  expressDeliveryButtonText: string;
  expressDeliveryTagline: string;
}

export type SettingsType = "auth" | "order" | "delivery_slots";
