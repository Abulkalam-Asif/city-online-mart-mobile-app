import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { tempCartItems } from "@/temp/home/products/tempCartItems";

const BillingDetailsSection = () => {
  // Calculate totals from cart items
  const calculateSubtotal = () => {
    return tempCartItems.reduce((total, item) => {
      return total + item.Price * item.quantity;
    }, 0);
  };

  const calculateSavings = () => {
    return tempCartItems.reduce((total, item) => {
      if (item.OldPrice && item.OldPrice > item.Price) {
        return total + (item.OldPrice - item.Price) * item.quantity;
      }
      return total;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const serviceFee = 20;
  const deliveryFee = 0; // Free delivery
  const originalDeliveryFee = 120;
  const totalAmount = subtotal + serviceFee + deliveryFee;

  return (
    <>
      <Text style={styles.titleText}>Billing Details</Text>
      <View style={styles.container}>
        <View style={styles.billingRow}>
          <View style={styles.leftSection}>
            <Text style={styles.labelText}>Subtotal</Text>
            {savings > 0 && (
              <View style={styles.savingsTag}>
                <Text style={styles.savingsText}>Saved Rs.{savings}</Text>
              </View>
            )}
          </View>
          <Text style={styles.amount}>Rs. {subtotal}</Text>
        </View>

        <View style={styles.billingRow}>
          <Text style={styles.labelText}>Service Fee</Text>
          <Text style={styles.amount}>Rs. {serviceFee}</Text>
        </View>

        <View style={styles.billingRow}>
          <View style={styles.leftSection}>
            <Text style={styles.labelText}>Delivery Fee</Text>
            <View style={styles.freeDeliveryTag}>
              <Text style={styles.freeDeliveryText}>Free Delivery</Text>
            </View>
          </View>
          <View style={styles.rightSection}>
            {originalDeliveryFee > 0 && (
              <Text style={styles.strikethroughPrice}>
                Rs. {originalDeliveryFee}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabelText}>Total Amount</Text>
          <Text style={styles.totalAmount}>Rs. {totalAmount}</Text>
        </View>
      </View>
    </>
  );
};

export default BillingDetailsSection;

const styles = StyleSheet.create({
  titleText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginTop: 20,
  },
  container: {
    marginTop: 10,
    padding: 16,
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  labelText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    marginRight: 10,
  },
  amount: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  savingsTag: {
    backgroundColor: theme.colors.tag,
    fontSize: 8,
    lineHeight: 16,
    fontFamily: theme.fonts.medium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    color: "black",
  },
  savingsText: {
    fontSize: 10,
    fontFamily: theme.fonts.semibold,
    color: "#000",
  },
  freeDeliveryTag: {
    backgroundColor: theme.colors.primary,
    fontSize: 8,
    lineHeight: 16,
    fontFamily: theme.fonts.medium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    color: "black",
  },
  freeDeliveryText: {
    fontSize: 10,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  strikethroughPrice: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    textDecorationLine: "line-through",
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.background,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabelText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  totalAmount: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
});
