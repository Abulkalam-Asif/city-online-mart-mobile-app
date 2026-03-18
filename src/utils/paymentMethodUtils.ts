import { ImageSourcePropType } from "react-native";

/**
 * Returns a user-friendly display name for a payment method type.
 */
export const getPaymentMethodDisplayName = (type: string, bankName?: string): string => {
  switch (type) {
    case "cash_on_delivery": return "Cash on Delivery";
    case "jazzcash": return "JazzCash";
    case "easypaisa": return "Easypaisa";
    case "bank_transfer": return bankName || "Bank Account";
    default: return type;
  }
};

/**
 * Returns the icon image source for a payment method type.
 */
export const getPaymentMethodImage = (type: string): ImageSourcePropType => {
  switch (type) {
    case "jazzcash": return require("@/src/assets/icons/payments/jazzcash.png");
    case "easypaisa": return require("@/src/assets/icons/payments/easypaisa.png");
    case "bank_transfer": return require("@/src/assets/icons/payments/bank.png");
    default: return require("@/src/assets/icons/payments/cod.png");
  }
};
