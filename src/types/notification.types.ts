/**
 * Data payload sent with push notifications.
 * Extend this as we add more notification types.
 */
export interface PushNotificationData {
  deepLink?: string;
  type?: string;
  orderId?: string;
  [key: string]: unknown;
}
