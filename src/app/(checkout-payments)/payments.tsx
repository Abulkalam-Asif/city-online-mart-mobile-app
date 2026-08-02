import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import { useModal } from "@/src/contexts/ModalContext";
import { useCart, useClearCart } from "@/src/hooks/useCart";
import { useSubmitPaymentProof } from "@/src/hooks/useOrders";
import { useGetAllPaymentMethods } from "@/src/hooks/usePaymentMethods";
import { useLocalSearchParams, router } from "expo-router";
import Loading from "@/src/components/common/Loading";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import OrderSuccessModal from "@/src/components/checkout-payment/payments/OrderSuccessModal";
import WhatsAppPaymentSection from "@/src/components/checkout-payment/payments/WhatsAppPaymentSection";
import BillingDetailsSection from "@/src/components/checkout-payment/checkout/BillingDetailsSection";
import OrderItemsList, { DisplayItem } from "@/src/components/common/OrderItemsList";
import { PaymentMethod } from "@/src/types/payment_method.types";
import { Ionicons } from "@expo/vector-icons";
import { getPaymentMethodDisplayName, getPaymentMethodImage } from "@/src/utils/paymentMethodUtils";

export default function PaymentsScreen() {
  // Receive orderId, paymentMethodId, paymentMethodType, and deliveryAddress from checkout screen
  const { orderId, paymentMethodId, deliveryAddress, deliverySlotId } = useLocalSearchParams<{
    orderId?: string;
    paymentMethodId?: string;
    deliveryAddress?: string;
    deliverySlotId?: string;
  }>();

  const isExpress = deliverySlotId === "fast-delivery";

  const [isChecked, setChecked] = useState(false);
  const [cartCleared, setCartCleared] = useState(false);
  const [error, setError] = useState("");

  // Hooks
  const { showModal } = useModal();
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useGetAllPaymentMethods();
  const clearCartMutation = useClearCart();
  const { cart } = useCart();

  // Find the selected payment method
  const selectedPaymentMethod = useMemo(() => {
    if (!paymentMethods || !paymentMethodId) return null;
    return paymentMethods.find((m: PaymentMethod) => m.id === paymentMethodId) || null;
  }, [paymentMethods, paymentMethodId]);

  // Calculate order total
  const orderTotal = useMemo(() => {
    if (!cart?.items) return 0;
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.discountPercentage > 0 ? item.discountedUnitPrice : item.unitPrice;
      return sum + price * item.quantity;
    }, 0);
    return subtotal;
  }, [cart?.items]);

  // Map cart items for display
  const displayItems = useMemo<DisplayItem[]>(() => {
    if (!cart?.items) return [];
    return cart.items.map(item => {
      const isDiscounted = item.discountPercentage > 0;
      const finalPrice = isDiscounted ? item.discountedUnitPrice : item.unitPrice;
      return {
        id: item.productId,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: finalPrice,
        totalPrice: finalPrice * item.quantity,
        imageUrl: item.imageUrl,
        originalPrice: isDiscounted ? item.unitPrice : undefined,
        discountPercentage: isDiscounted ? item.discountPercentage : undefined,
      };
    });
  }, [cart?.items]);

  // Handle payment confirmation (optional step)
  const handleConfirmPayment = useCallback(() => {
    if (!cartCleared) {
      clearCartMutation.mutate();
      setCartCleared(true);
    }
    showModal("order-success", <OrderSuccessModal />);
  }, [cartCleared, clearCartMutation, showModal]);

  const handleGoBack = useCallback(() => {
    // Navigate back to checkout, passing back existing data so inputs are preserved
    router.replace({
      pathname: "/checkout",
      params: {
        existingOrderId: orderId || "",
        deliveryAddress: deliveryAddress || "",
        paymentMethodType: selectedPaymentMethod?.type || "",
        paymentMethodId: paymentMethodId || "",
        deliverySlotId: deliverySlotId || "",
      },
    });
  }, [orderId, deliveryAddress, paymentMethodId, selectedPaymentMethod, deliverySlotId]);

  // Intercept hardware back button — go to checkout, not cart
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleGoBack();
      return true; // prevent default back behavior
    });
    return () => subscription.remove();
  }, [handleGoBack]);

  // Guard: must have orderId
  if (!orderId) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="Payment" />
        <View style={styles.centeringContainer}>
          <Text style={styles.errorText}>No order found. Please go back to checkout.</Text>
        </View>
      </View>
    );
  }

  if (loadingPaymentMethods) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="Payment" />
        <View style={styles.centeringContainer}>
          <Loading text="Loading..." />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.mainContainer}>
        <GeneralTopBar text="Payment" onBackPress={handleGoBack} />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>

          {/* Order ID */}
          <View style={styles.orderIdSection}>
            <Ionicons name="receipt-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
          </View>

          {/* Payment Method & Account Details */}
          {selectedPaymentMethod && (
            <View style={styles.paymentMethodSection}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.paymentMethodCard}>
                <View style={styles.paymentMethodHeader}>
                  <Image
                    source={getPaymentMethodImage(selectedPaymentMethod.type)}
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentMethodName}>
                    {getPaymentMethodDisplayName(selectedPaymentMethod.type, selectedPaymentMethod.accountDetails?.bankName)}
                  </Text>
                </View>

                {selectedPaymentMethod.accountDetails && (
                  <View style={styles.accountDetailsContainer}>
                    <View style={styles.accountDetailRow}>
                      <Text style={styles.accountDetailLabel}>Account Number</Text>
                      <Text style={styles.accountDetailValue}>
                        {selectedPaymentMethod.accountDetails.accountNumber}
                      </Text>
                    </View>
                    <View style={styles.accountDetailRow}>
                      <Text style={styles.accountDetailLabel}>Account Title</Text>
                      <Text style={styles.accountDetailValue}>
                        {selectedPaymentMethod.accountDetails.accountTitle}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Order Items */}
          <OrderItemsList items={displayItems} />

          {/* Billing Details */}
          <BillingDetailsSection
            isOnlinePayment={!!selectedPaymentMethod && selectedPaymentMethod.type !== "cash_on_delivery"}
            isExpress={isExpress}
          />

          {/* WhatsApp Payment Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Verify Payment via WhatsApp</Text>
            <WhatsAppPaymentSection
              orderId={orderId}
              totalAmount={orderTotal}
              paymentMethodName={selectedPaymentMethod ? getPaymentMethodDisplayName(selectedPaymentMethod.type, selectedPaymentMethod.accountDetails?.bankName) : undefined}
              isChecked={isChecked}
              setChecked={setChecked}
            />
          </View>
        </ScrollView>

        <View style={styles.proceedButtonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.proceedButton,
              pressed && styles.proceedButtonPressed,
            ]}
            onPress={handleConfirmPayment}>
            <Text style={styles.proceedButtonText}>
              Confirm Payment Sent
            </Text>
          </Pressable>
        </View>
      </View>


      {/* Error Banner */}
      {error && (
        <ErrorBanner
          title="Error"
          message={error}
          onDismiss={() => setError("")}
        />
      )}
    </>
  );
}

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
  centeringContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  orderIdSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary_light,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  orderIdText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  paymentMethodSection: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: 10,
  },
  paymentMethodCard: {
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
    padding: 16,
  },
  paymentMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: {
    width: 24,
    height: 24,
  },
  paymentMethodName: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  accountDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    gap: 8,
  },
  accountDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountDetailLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
  },
  accountDetailValue: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  uploadSection: {
    marginTop: 20,
  },
  proceedButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderTopColor: "#F3F4F6",
    borderTopWidth: 1,
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  proceedButtonPressed: {
    opacity: 0.88,
  },
  proceedButtonDisabled: {
    backgroundColor: theme.colors.background,
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: "#fff",
  },
});
