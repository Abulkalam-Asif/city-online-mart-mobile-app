import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { theme } from "@/src/constants/theme";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { Image } from "expo-image";
import {
  MaterialCommunityIcons,
  FontAwesome6,
  Feather,
} from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import HiddenCaptureView from "./HiddenCaptureView";
import { useGetOrderById } from "@/src/hooks/useOrders";
import { OrderStatus } from "@/src/types";

type OrderDetailsContentProps = {
  orderId?: string;
  status?: OrderStatus;
};

const OrderDetailsContent = ({
  orderId = "3378373",
}: OrderDetailsContentProps) => {
  const [isBillingDetailsExpanded, setIsBillingDetailsExpanded] =
    useState(true);
  const viewShotRef = useRef<ViewShot>(null);

  // Fetch real order data from Firestore
  const { data: orderData, isLoading, error } = useGetOrderById(orderId);

  const paymentMethodImage = () => {
    const paymentType = orderData?.paymentMethod?.type;
    switch (paymentType) {
      case "cash_on_delivery":
        return require("@/src/assets/icons/payments/cod.png");
      case "bank_transfer":
        return require("@/src/assets/icons/payments/bank.png");
      case "easypaisa":
        return require("@/src/assets/icons/payments/easypaisa.png");
      case "jazzcash":
        return require("@/src/assets/icons/payments/jazzcash.png");
      default:
        return require("@/src/assets/icons/payments/cod.png");
    }
  };

  const getStatusColor = () => {
    switch (orderData?.status) {
      case "pending":
      case "confirmed":
      case "shipped":
        return theme.colors.secondary;
      case "delivered":
        return theme.colors.success;
      case "cancelled":
      case "refunded":
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getStatusText = () => {
    switch (orderData?.status) {
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
      case "refunded":
        return "Refunded";
      default:
        return "Unknown";
    }
  };

  // Calculate billing details from real order data
  const subtotal = orderData?.subtotal || 0;
  const discount = orderData?.discount || 0;
  const serviceFee = 0;
  const deliveryFee = orderData?.deliveryFee || 0;
  const totalAmount = orderData?.total || 0;

  const handleDownloadOrderSummary = async () => {
    try {
      // Request permission to save to gallery (write-only permission)
      const { status } = await MediaLibrary.requestPermissionsAsync(false);

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to save images to your gallery."
        );
        return;
      }

      // Capture the hidden view as an image
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();

        // Save to gallery
        const asset = await MediaLibrary.createAssetAsync(uri);

        try {
          await MediaLibrary.createAlbumAsync("Orders", asset, false);
        } catch {
          // Album might already exist, that's okay
        }

        Alert.alert("Success", "Order summary has been saved to your gallery!");
      }
    } catch (error) {
      console.error("Error saving order summary:", error);
      Alert.alert("Error", "Failed to save order summary. Please try again.");
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text={`Order #${orderId}`} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  // Handle error state
  if (error || !orderData) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text={`Order #${orderId}`} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load order details</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text={`Order #${orderId}`} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {/* Order Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleText}>Order details</Text>
          <View style={styles.orderDetailsCard}>
            <View style={styles.orderDetailsLeft}>
              <Text style={styles.orderStatusText}>
                Order is{" "}
                <Text
                  style={[
                    styles.statusText,
                    { color: theme.colors[orderData.status] },
                  ]}>
                  {getStatusText()}
                </Text>
                {(orderData.status === "pending" ||
                  orderData.status === "confirmed" ||
                  orderData.status === "shipped") &&
                  " and will deliver on"}
              </Text>
              <Text style={styles.deliveryTimeText}>
                Friday 26th September 10:00 am
              </Text>
            </View>
            <Image
              source={require("@/src/assets/rider.png")}
              style={styles.riderImage}
            />
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleText}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color={theme.colors.text_secondary}
            />
            <Text style={styles.addressText}>{orderData.deliveryAddress}</Text>
          </View>
        </View>

        {/* Payment Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleText}>Payment details</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.totalAmountText}>Total Amount</Text>
              <Text style={styles.paymentAmountText}>Rs. {totalAmount}</Text>
            </View>
            <View style={styles.paymentRow}>
              <View style={styles.paymentMethodRow}>
                <Image
                  source={paymentMethodImage()}
                  style={styles.paymentMethodImage}
                />
                <Text style={styles.paymentLabelText}>Payment Method</Text>
              </View>
              <Text style={styles.paymentMethodText}>Cash on Delivery</Text>
            </View>
          </View>
        </View>

        {/* Billing Details Section */}
        <View style={styles.section}>
          <View style={styles.billingHeader}>
            <Text style={styles.sectionTitleText}>Billing Details</Text>
            <Pressable
              style={styles.downloadButton}
              onPress={handleDownloadOrderSummary}>
              <Feather name="download" size={20} color={theme.colors.text} />
            </Pressable>
            <Pressable
              style={styles.expandButton}
              onPress={() =>
                setIsBillingDetailsExpanded(!isBillingDetailsExpanded)
              }>
              <FontAwesome6
                name={isBillingDetailsExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          {isBillingDetailsExpanded && (
            <View style={styles.billingCard}>
              <View style={styles.billingRow}>
                <View style={styles.leftSection}>
                  <Text style={styles.billingLabelText}>Subtotal</Text>
                  {discount > 0 && (
                    <View style={styles.savingsTag}>
                      <Text style={styles.savingsText}>
                        Saved Rs.{discount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.billingAmountText}>Rs. {subtotal}</Text>
              </View>

              <View style={styles.billingRow}>
                <Text style={styles.billingLabelText}>Service Fee</Text>
                <Text style={styles.billingAmountText}>Rs. {serviceFee}</Text>
              </View>

              <View style={styles.billingRow}>
                <View style={styles.leftSection}>
                  <Text style={styles.billingLabelText}>Delivery Fee</Text>
                  {/* <View style={styles.freeDeliveryTag}>
                    <Text style={styles.freeDeliveryText}>Free Delivery</Text>
                  </View> */}
                </View>
                <View style={styles.rightSection}>
                  {deliveryFee > 0 && (
                    <Text style={styles.billingAmountText}>
                      Rs. {deliveryFee}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.totalRow}>
                <Text style={styles.totalAmountText}>Total Amount</Text>
                <Text style={styles.totalAmountText}>Rs. {totalAmount}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Hidden View for Capture */}
      <HiddenCaptureView
        viewShotRef={viewShotRef}
        orderId={orderId}
        subtotal={subtotal}
        serviceFee={serviceFee}
        deliveryFee={deliveryFee}
        totalAmount={totalAmount}
        discount={discount}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      {/* Bottom Action Buttons */}
      <View style={styles.bottomButtonContainer}>
        {/* Show options to cancel or edit order only if status is pending and payment method is cash on delivery */}
        {orderData.status === "pending" &&
          orderData.paymentMethod.type === "cash_on_delivery" && (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.editButtonText}>Edit Order</Text>
              </Pressable>
            </>
          )}
        {orderData.status === "delivered" && (
          <Pressable
            style={({ pressed }) => [
              styles.reviewButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.reviewButtonText}>Add a Review</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default OrderDetailsContent;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginBottom: 8,
  },

  // Order Details
  orderDetailsCard: {
    backgroundColor: theme.colors.background_3,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDetailsLeft: {
    flex: 1,
  },
  orderStatusText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontFamily: theme.fonts.semibold,
  },
  deliveryTimeText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  riderImage: {
    width: 60,
    height: 60,
  },

  // Delivery Address
  addressCard: {
    backgroundColor: theme.colors.background_3,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },

  // Payment Details
  paymentCard: {
    backgroundColor: theme.colors.background_3,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmountText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  paymentLabelText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  paymentAmountText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  paymentMethodImage: {
    width: 24,
    height: 24,
  },
  paymentMethodText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.success,
  },

  // Billing Details
  billingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  downloadButton: {
    padding: 4,
    marginLeft: "auto",
  },
  expandButton: {
    padding: 4,
  },
  billingCard: {
    backgroundColor: theme.colors.background_3,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
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
  billingLabelText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    marginRight: 10,
  },
  billingAmountText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  savingsTag: {
    backgroundColor: theme.colors.tag,
    fontSize: 8,
    lineHeight: 16,
    fontFamily: theme.fonts.semibold,
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

  // Bottom Buttons
  bottomButtonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.error_light,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.error,
  },
  editButton: {
    flex: 1,
    backgroundColor: theme.colors.success_light,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.success,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  buttonPressed: {
    opacity: 0.8,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: "red",
  },
});
