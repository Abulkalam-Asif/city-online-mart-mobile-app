import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ViewShot from "react-native-view-shot";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type HiddenCaptureViewProps = {
  viewShotRef: React.RefObject<ViewShot | null>;
  orderId: string;
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  totalAmount: number;
  discount: number;
  getStatusColor: () => string;
  getStatusText: () => string;
  deliveryAddress: string;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  paymentStatusColor?: string;
  placedOnText: string;
};

const HiddenCaptureView = ({
  viewShotRef,
  orderId,
  subtotal,
  serviceFee,
  deliveryFee,
  totalAmount,
  discount,
  getStatusColor,
  getStatusText,
  deliveryAddress,
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusColor,
  placedOnText,
}: HiddenCaptureViewProps) => {
  return (
    <>
      <View style={styles.hiddenCaptureContainer}>
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
          <View style={styles.captureView}>
            {/* Header */}
            <View style={styles.captureHeader}>
              <Text style={styles.captureHeaderTitle}>Order Summary</Text>
              <Text style={styles.captureOrderId}>Order #{orderId}</Text>
            </View>

            {/* Order Details */}
            <View style={styles.captureSection}>
              <Text style={styles.captureSectionTitle}>Order details</Text>
              <View style={styles.captureStatusCard}>
                <Text style={styles.captureStatusText}>
                  Order is{" "}
                  <Text
                    style={[styles.captureStatusBold, { color: getStatusColor() }]}
                  >
                    {getStatusText()}
                  </Text>
                </Text>
                <Text style={styles.captureDeliveryTime}>
                  Placed on {placedOnText || "N/A"}
                </Text>
              </View>
            </View>

            {/* Delivery Address */}
            <View style={styles.captureSection}>
              <Text style={styles.captureSectionTitle}>Delivery Address</Text>
              <View style={styles.captureCard}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.captureAddressText}>
                  {deliveryAddress || "N/A"}
                </Text>
              </View>
            </View>

            {/* Payment Details */}
            <View style={styles.captureSection}>
              <Text style={styles.captureSectionTitle}>Payment details</Text>
              <View style={styles.captureCard}>
                <View style={styles.captureRow}>
                  <Text style={styles.captureLabel}>Total Amount:</Text>
                  <Text
                    style={[styles.captureValue, styles.captureTotalAmount]}>
                    Rs. {totalAmount}
                  </Text>
                </View>
                <View style={styles.captureRow}>
                  <Text style={styles.captureLabel}>Payment Method:</Text>
                  <Text style={styles.captureValue}>{paymentMethodLabel}</Text>
                </View>
                <View style={styles.captureRow}>
                  <Text style={styles.captureLabel}>Payment Status:</Text>
                  <Text
                    style={[
                      styles.captureValue,
                      paymentStatusColor ? { color: paymentStatusColor } : null,
                    ]}>
                    {paymentStatusLabel}
                  </Text>
                </View>
              </View>
            </View>

            {/* Billing Details */}
            <View style={styles.captureSection}>
              <Text style={styles.captureSectionTitle}>Billing Details</Text>
              <View style={styles.captureCard}>
                <View style={styles.captureRow}>
                  <View style={styles.captureLeftRow}>
                    <Text style={styles.captureLabel}>Subtotal</Text>
                    {discount > 0 && (
                      <View style={styles.captureSavingsTag}>
                        <Text style={styles.captureSavingsText}>
                          Saved Rs.{discount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.captureValue}>Rs. {subtotal}</Text>
                </View>

                <View style={styles.captureRow}>
                  <Text style={styles.captureLabel}>Service Fee</Text>
                  <Text style={styles.captureValue}>Rs. {serviceFee}</Text>
                </View>

                <View style={styles.captureRow}>
                  <View style={styles.captureLeftRow}>
                    <Text style={styles.captureLabel}>Delivery Fee</Text>
                    {deliveryFee === 0 && (
                      <View style={styles.captureFreeTag}>
                        <Text style={styles.captureFreeText}>FREE</Text>
                      </View>
                    )}
                  </View>
                  {deliveryFee > 0 ? (
                    <Text style={styles.captureValue}>Rs. {deliveryFee}</Text>
                  ) : null}
                </View>

                <View style={styles.captureSeparator} />

                <View style={styles.captureRow}>
                  <Text style={styles.captureTotalLabel}>Total Amount</Text>
                  <Text style={styles.captureTotalValue}>
                    Rs. {totalAmount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.captureFooter}>
              <Text style={styles.captureFooterText}>
                Generated on {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </ViewShot>
      </View>
    </>
  );
};

export default HiddenCaptureView;

const styles = StyleSheet.create({
  hiddenCaptureContainer: {
    position: "absolute",
    left: -9999,
    top: 0,
  },
  captureView: {
    width: 400,
    backgroundColor: "#fff",
    padding: 24,
  },
  captureHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  captureHeaderTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  captureOrderId: {
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text_secondary,
  },
  captureSection: {
    marginBottom: 20,
  },
  captureSectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  captureStatusCard: {
    backgroundColor: theme.colors.background_3,
    padding: 16,
    borderRadius: 8,
  },
  captureStatusText: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: 8,
  },
  captureStatusBold: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  captureDeliveryTime: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  captureCard: {
    backgroundColor: theme.colors.background_3,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  captureAddressText: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 20,
    flex: 1,
  },
  captureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  captureLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  captureLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
  },
  captureValue: {
    fontSize: 13,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  captureTotalAmount: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  captureSavingsTag: {
    backgroundColor: theme.colors.tag,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  captureSavingsText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    color: "#000",
  },
  captureFreeTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  captureFreeText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    color: "#fff",
  },
  captureStrikethrough: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    textDecorationLine: "line-through",
  },
  captureSeparator: {
    height: 2,
    backgroundColor: theme.colors.background,
    marginVertical: 8,
  },
  captureTotalLabel: {
    fontSize: 15,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  captureTotalValue: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
  captureFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    alignItems: "center",
  },
  captureFooterText: {
    fontSize: 11,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
  },
});
