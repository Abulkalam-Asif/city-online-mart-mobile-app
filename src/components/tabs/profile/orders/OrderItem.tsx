import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { OrderStatus } from "@/src/types";

type OrderItemProps = {
  date: string;
  itemCount: number;
  price: number;
  status: OrderStatus;
  orderId: string;
  /** Only when the order has an active refund: price after refunds and "Refunded" / "Partly refunded". */
  refund?: { adjustedPrice: number; label: string };
};

// Non-breaking space: keeps the refund label on one line when the row is narrow
const NBSP = String.fromCharCode(160);

const OrderItem = ({
  date,
  itemCount,
  price,
  status,
  orderId,
  refund,
}: OrderItemProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return {
          bg: theme.colors.pending_light,
          text: theme.colors.pending,
          icon: theme.colors.pending,
        };
      case "confirmed":
        return {
          bg: theme.colors.confirmed_light,
          text: theme.colors.confirmed,
          icon: theme.colors.confirmed,
        };
      case "shipped":
        return {
          bg: theme.colors.shipped_light,
          text: theme.colors.shipped,
          icon: theme.colors.shipped,
        };
      case "delivered":
        return {
          bg: theme.colors.delivered_light,
          text: theme.colors.delivered,
          icon: theme.colors.delivered,
        };
      case "cancelled":
        return {
          bg: theme.colors.cancelled_light,
          text: theme.colors.cancelled,
          icon: theme.colors.cancelled,
        };
      default:
        return {
          bg: theme.colors.warning_light,
          text: theme.colors.warning,
          icon: theme.colors.warning,
        };
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
      case "confirmed":
        return "cart-outline"; // Cart outline - order received and confirmed
      case "shipped":
        return "cart-arrow-right"; // Cart with arrow - in transit
      case "delivered":
        return "cart-check"; // Cart with checkmark - successfully delivered
      case "cancelled":
        return "cart-remove"; // Cart with X - order cancelled
      default:
        return "cart";
    }
  };

  const colors = getStatusColor();

  const handlePress = () => {
    // Navigate to order details
    router.push(`/order-details?id=${orderId}` as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
        {
          <MaterialCommunityIcons
            name={getStatusIcon()}
            size={28}
            color={colors.icon}
          />
        }
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.orderIdText}>
          #{orderId}
          {/* On the order-number line so refunded rows keep the same height */}
          {refund ? <Text style={styles.refundLabelText}>{` ·${NBSP}${refund.label.split(" ").join(NBSP)}`}</Text> : null}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={styles.itemCountText}>{itemCount} items</Text>
          {refund ? (
            <>
              <Text style={styles.originalPriceText}>Rs.{price}</Text>
              <Text style={styles.priceText}>Rs.{refund.adjustedPrice}</Text>
            </>
          ) : (
            <Text style={styles.priceText}>Rs.{price}</Text>
          )}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {status === "delivered" && (
          <Text style={styles.reviewText} numberOfLines={1}>Leave your Review</Text>
        )}
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <FontAwesome6
        name="chevron-right"
        size={14}
        color={theme.colors.text_secondary}
      />
    </Pressable>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#fff",
    gap: 12,
  },
  containerPressed: {
    backgroundColor: theme.colors.background_3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  orderIdText: {
    fontSize: 11,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text_secondary,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap", // long refunded amounts wrap instead of running into the status column
    columnGap: 12,
    rowGap: 2,
  },
  itemCountText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
  priceText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  rightContainer: {
    alignItems: "center",
    gap: 6,
  },
  reviewText: {
    fontSize: 8,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 8,
    fontFamily: theme.fonts.semibold,
  },
  originalPriceText: {
    fontSize: 11,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    textDecorationLine: "line-through",
  },
  refundLabelText: {
    color: theme.colors.error,
  },
});
