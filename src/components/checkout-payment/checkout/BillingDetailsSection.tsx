import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { useCart } from "@/src/hooks/useCart";
import { queryClient, queryKeys } from "@/src/lib/react-query";
import { OrderSettings } from "@/src/types";

const BillingDetailsSection = () => {
  const { data: cart } = useCart();

  const orderSettings = queryClient.getQueryData<OrderSettings>(
    queryKeys.settings.byDomain("order")
  );

  // Calculate totals from cart data
  const itemsSubtotal = cart?.total || 0;
  const orderDiscount = cart?.appliedOrderDiscount?.amount || 0;
  const discountPercentage = cart?.appliedOrderDiscount?.percentage || 0;
  const finalSubtotal = itemsSubtotal - orderDiscount;
  const deliveryFee = orderSettings?.deliveryFee || 0;
  const totalAmount = finalSubtotal + deliveryFee;

  return (
    <>
      <Text style={styles.titleText}>Billing Details</Text>
      <View style={styles.container}>
        <View style={styles.billingRow}>
          <View style={styles.leftSection}>
            <Text style={styles.labelText}>Items Subtotal</Text>
          </View>
          <Text style={styles.amount}>Rs. {itemsSubtotal}</Text>
        </View>

        {orderDiscount > 0 && (
          <View style={styles.billingRow}>
            <View style={styles.leftSection}>
              <Text style={styles.labelText}>Order Discount</Text>
              <View style={styles.tag}>
                <Text style={styles.discountText}>{discountPercentage}% off</Text>
              </View>
            </View>
            <Text style={styles.discountAmount}>-Rs. {orderDiscount}</Text>
          </View>
        )}

        <View style={styles.billingRow}>
          <Text style={styles.labelText}>Final Subtotal</Text>
          <Text style={styles.amount}>Rs. {finalSubtotal}</Text>
        </View>

        <View style={styles.billingRow}>
          <View style={styles.leftSection}>
            <Text style={styles.labelText}>Delivery Fee</Text>
            {deliveryFee === 0 &&
              <View style={styles.tag}>
                <Text style={styles.freeDeliveryText}>Free Delivery</Text>
              </View>
            }
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.amount}>Rs. {deliveryFee}</Text>
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
    marginRight: 8,
  },
  amount: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  discountText: {
    fontSize: 10,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  discountAmount: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  tag: {
    backgroundColor: theme.colors.primary,
    color: "white",
    fontSize: 8,
    lineHeight: 16,
    fontFamily: theme.fonts.semibold,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  freeDeliveryText: {
    fontSize: 10,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
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
