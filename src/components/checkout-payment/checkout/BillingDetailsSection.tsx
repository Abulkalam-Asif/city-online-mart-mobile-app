import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "@/src/constants/theme";
import { useCart } from "@/src/hooks/useCart";
import { calculateOrderDiscount } from "@/src/utils/orderDiscounts";

const BillingDetailsSection = () => {
  const { data: cart } = useCart();

  // Order discount state
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [discountName, setDiscountName] = useState<string | undefined>();

  // Calculate order discount when cart changes
  useEffect(() => {
    const calculateDiscount = async () => {
      if (cart?.total) {
        try {
          const { discountAmount, discountName: name } =
            await calculateOrderDiscount(cart.total);
          setOrderDiscount(discountAmount);
          setDiscountName(name);
        } catch (error) {
          console.error("Failed to calculate order discount:", error);
          setOrderDiscount(0);
          setDiscountName(undefined);
        }
      } else {
        setOrderDiscount(0);
        setDiscountName(undefined);
      }
    };

    calculateDiscount();
  }, [cart?.total]);

  // Calculate totals from real cart items
  const cartTotal = cart?.total || 0;
  const subtotal = cartTotal - orderDiscount; // Subtotal after order discount
  const serviceFee = 0;
  const deliveryFee = 0;
  const totalAmount = subtotal + serviceFee + deliveryFee;

  return (
    <>
      <Text style={styles.titleText}>Billing Details</Text>
      <View style={styles.container}>
        <View style={styles.billingRow}>
          <View style={styles.leftSection}>
            <Text style={styles.labelText}>Subtotal</Text>
            {orderDiscount > 0 && (
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>
                  {discountName
                    ? `${discountName} applied`
                    : "Discount applied"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.amount}>Rs. {subtotal}</Text>
        </View>

        {orderDiscount > 0 && (
          <View style={styles.billingRow}>
            <Text style={styles.labelText}>Order Discount</Text>
            <Text style={styles.discountAmount}>-Rs. {orderDiscount}</Text>
          </View>
        )}

        <View style={styles.billingRow}>
          <Text style={styles.labelText}>Service Fee</Text>
          <Text style={styles.amount}>Rs. {serviceFee}</Text>
        </View>

        <View style={styles.billingRow}>
          <View style={styles.leftSection}>
            <Text style={styles.labelText}>Delivery Fee</Text>
            {/* <View style={styles.freeDeliveryTag}>
              <Text style={styles.freeDeliveryText}>Free Delivery</Text>
            </View> */}
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
    marginRight: 10,
  },
  amount: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  discountTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
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
