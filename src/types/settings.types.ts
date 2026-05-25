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

export type SettingsType = "auth" | "order";
