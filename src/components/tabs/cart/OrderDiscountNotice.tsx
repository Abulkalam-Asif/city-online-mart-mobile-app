import { StyleSheet, Text } from "react-native";
import React from "react";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { formatPrice } from "@/src/utils/formatPrice";

interface OrderDiscountNoticeProps {
  percentage: number;
  amount: number;
}

/**
 * Short notice that floats just above the cart footer when an order-level discount kicks in
 * (it used to change the total silently). The cart hides it again after a few seconds, so the
 * footer itself stays a single line. Put it in a relatively positioned wrapper around the footer.
 */
const OrderDiscountNotice = ({ percentage, amount }: OrderDiscountNoticeProps) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOut.duration(200)}
      pointerEvents="none"
      style={styles.notice}
    >
      <Ionicons name="pricetag" size={14} color={theme.colors.primary} />
      <Text style={styles.text}>
        {percentage}% order discount applied, you save Rs. {formatPrice(amount)}
      </Text>
    </Animated.View>
  );
};

export default OrderDiscountNotice;

const styles = StyleSheet.create({
  notice: {
    position: "absolute",
    bottom: "100%",
    left: 16,
    right: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.primary_light,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
});
