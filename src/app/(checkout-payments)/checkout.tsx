import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import ExpectedDeliveryTimeSection from "@/src/components/checkout-payment/checkout/ExpectedDeliveryTimeSection";
import BillingDetailsSection from "@/src/components/checkout-payment/checkout/BillingDetailsSection";
import { router, useLocalSearchParams } from "expo-router";
import AddressInfoSection from "@/src/components/checkout-payment/checkout/AddressInfoSection";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import OrderSuccessModal from "@/src/components/checkout-payment/payments/OrderSuccessModal";
import { CONSTANTS } from "@/src/constants/constants";
import { useGetAllPaymentMethods } from "@/src/hooks/usePaymentMethods";
import { useCart, useClearCart } from "@/src/hooks/useCart";
import { usePlaceOrder, useUpdateOrderDetails } from "@/src/hooks/useOrders";
import { useAuth } from "@/src/contexts/AuthContext";
import { useModal } from "@/src/contexts/ModalContext";
import { PaymentMethod, PaymentMethodType } from "@/src/types/payment_method.types";
import Loading from "@/src/components/common/Loading";
import { Image } from "expo-image";
import { getPaymentMethodDisplayName, getPaymentMethodImage } from "@/src/utils/paymentMethodUtils";

// The 4 fixed top-level types shown in dropdown
const PAYMENT_METHOD_TYPES: { type: PaymentMethodType; label: string }[] = [
  { type: "cash_on_delivery", label: "Cash on Delivery" },
  { type: "jazzcash", label: "JazzCash" },
  { type: "easypaisa", label: "Easypaisa" },
  { type: "bank_transfer", label: "Bank Transfer" },
];

export default function CheckoutScreen() {
  const {
    existingOrderId: existingOrderIdParam,
    deliveryAddress: deliveryAddressParam,
    paymentMethodType: paymentMethodTypeParam,
    paymentMethodId: paymentMethodIdParam,
  } = useLocalSearchParams<{
    existingOrderId?: string;
    deliveryAddress?: string;
    paymentMethodType?: string;
    paymentMethodId?: string;
  }>();

  const [address, setAddress] = useState(deliveryAddressParam || "");
  const [showAddressError, setShowAddressError] = useState(false);

  // Two-tier selection: type first, then specific account for bank_transfer
  const [selectedMethodType, setSelectedMethodType] = useState<PaymentMethodType | "">(
    (paymentMethodTypeParam as PaymentMethodType) || ""
  );
  const [selectedBankMethodId, setSelectedBankMethodId] = useState<string>(
    paymentMethodIdParam || ""
  );

  // Dropdown visibility
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [error, setError] = useState("");
  const [cartCleared, setCartCleared] = useState(false);
  const [existingOrderId, setExistingOrderId] = useState<string | null>(
    existingOrderIdParam || null
  );

  // Hooks
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useGetAllPaymentMethods();
  const { cart, loading: loadingCart } = useCart();
  const { user } = useAuth();
  const { showModal } = useModal();
  const placeOrderMutation = usePlaceOrder();
  const updateOrderMutation = useUpdateOrderDetails();
  const clearCartMutation = useClearCart();

  // Address validation
  const MIN_ADDRESS_LENGTH = CONSTANTS.checkout.addressMinLength;
  const isAddressValid = address.trim().length >= MIN_ADDRESS_LENGTH;
  const remainingChars = MIN_ADDRESS_LENGTH - address.trim().length;

  // Bank transfer accounts (sorted by displayOrder ascending)
  const bankAccounts = useMemo(() => {
    if (!paymentMethods) return [];
    return paymentMethods
      .filter((m: PaymentMethod) => m.type === "bank_transfer" && m.isActive)
      .sort((a: PaymentMethod, b: PaymentMethod) => a.displayOrder - b.displayOrder);
  }, [paymentMethods]);

  // Resolve the final PaymentMethod object from the two-tier selection
  const selectedPaymentMethod = useMemo<PaymentMethod | null>(() => {
    if (!paymentMethods || !selectedMethodType) return null;

    if (selectedMethodType === "bank_transfer") {
      // Must have a specific bank account selected
      if (!selectedBankMethodId) return null;
      return paymentMethods.find((m: PaymentMethod) => m.id === selectedBankMethodId) || null;
    }

    if (selectedMethodType === "cash_on_delivery") {
      // Pick the first active COD method
      return (
        paymentMethods
          .filter((m: PaymentMethod) => m.type === "cash_on_delivery" && m.isActive)
          .sort((a: PaymentMethod, b: PaymentMethod) => a.displayOrder - b.displayOrder)[0] || null
      );
    }

    // jazzcash or easypaisa: auto-pick first active by displayOrder
    return (
      paymentMethods
        .filter((m: PaymentMethod) => m.type === selectedMethodType && m.isActive)
        .sort((a: PaymentMethod, b: PaymentMethod) => a.displayOrder - b.displayOrder)[0] || null
    );
  }, [paymentMethods, selectedMethodType, selectedBankMethodId]);

  const isCOD = selectedMethodType === "cash_on_delivery";
  const isBankTransfer = selectedMethodType === "bank_transfer";

  // Is the overall selection complete?
  const isPaymentSelected = useMemo(() => {
    if (!selectedMethodType) return false;
    if (isBankTransfer) return !!selectedBankMethodId;
    return true;
  }, [selectedMethodType, isBankTransfer, selectedBankMethodId]);

  // Button text
  const buttonText = useMemo(() => {
    if (placeOrderMutation.isPending || updateOrderMutation.isPending) return "Processing...";
    if (existingOrderId && isCOD) return "Place Order";
    if (existingOrderId) return "Update & Continue";
    return isCOD ? "Place Order" : "Finalize Order";
  }, [isCOD, placeOrderMutation.isPending, updateOrderMutation.isPending, existingOrderId]);

  // Is proceed disabled?
  const isProceedDisabled = useMemo(() => {
    return (
      !isPaymentSelected ||
      !isAddressValid ||
      !cart ||
      cart.items.length === 0 ||
      placeOrderMutation.isPending ||
      updateOrderMutation.isPending
    );
  }, [isPaymentSelected, isAddressValid, cart, placeOrderMutation.isPending, updateOrderMutation.isPending]);

  // Handle successful COD order placement (new order)
  useEffect(() => {
    if (placeOrderMutation.isSuccess && !cartCleared && isCOD) {
      clearCartMutation.mutate();
      setCartCleared(true);
      showModal("order-success", <OrderSuccessModal />);
    }
  }, [placeOrderMutation.isSuccess, cartCleared, isCOD]);

  // Handle successful new online order — navigate to payments screen
  useEffect(() => {
    if (placeOrderMutation.isSuccess && !isCOD && placeOrderMutation.data) {
      const orderId = placeOrderMutation.data;
      setExistingOrderId(orderId);
      router.replace({
        pathname: "/payments",
        params: {
          orderId,
          paymentMethodId: selectedPaymentMethod?.id || "",
          deliveryAddress: address,
        },
      });
    }
  }, [placeOrderMutation.isSuccess, isCOD, placeOrderMutation.data]);

  // Handle successful order update
  useEffect(() => {
    if (!updateOrderMutation.isSuccess || !existingOrderId) return;

    if (isCOD) {
      // COD update: clear cart and show success (order already in DB, no proof needed)
      if (!cartCleared) {
        clearCartMutation.mutate();
        setCartCleared(true);
        showModal("order-success", <OrderSuccessModal />);
      }
    } else {
      // Online update: navigate to payments screen for proof upload
      router.replace({
        pathname: "/payments",
        params: {
          orderId: existingOrderId,
          paymentMethodId: selectedPaymentMethod?.id || "",
          deliveryAddress: address,
        },
      });
    }
  }, [updateOrderMutation.isSuccess]);

  // Intercept hardware back button when an order has been created
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (existingOrderId) {
        setShowLeaveWarning(true);
        return true; // prevent default back behavior
      }
      return false; // allow default back behavior
    });
    return () => subscription.remove();
  }, [existingOrderId]);

  // Handle errors
  useEffect(() => {
    if (placeOrderMutation.isError) {
      setError(placeOrderMutation.error?.message || "Failed to place order.");
    }
  }, [placeOrderMutation.isError]);

  useEffect(() => {
    if (updateOrderMutation.isError) {
      setError(updateOrderMutation.error?.message || "Failed to update order.");
    }
  }, [updateOrderMutation.isError]);

  // When user changes type, clear the bank sub-selection
  const handleSelectType = useCallback((type: PaymentMethodType) => {
    setSelectedMethodType(type);
    if (type !== "bank_transfer") {
      setSelectedBankMethodId("");
    }
    setShowTypeDropdown(false);
  }, []);

  // Create or update order
  const executeOrder = useCallback(() => {
    if (!selectedPaymentMethod || !cart || !user) return;

    if (existingOrderId) {
      // Remove any undefined values from paymentMethod since Firestore throws errors for undefined
      const cleanPaymentMethod = JSON.parse(JSON.stringify(selectedPaymentMethod));

      updateOrderMutation.mutate({
        orderId: existingOrderId,
        updates: {
          deliveryAddress: address,
          paymentMethod: cleanPaymentMethod,
        },
      });
    } else {
      placeOrderMutation.mutate({
        customerId: user.uid,
        customerName: user.displayName || "",
        customerPhone: user.phoneNumber || "",
        source: "mobile",
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: selectedPaymentMethod,
        deliveryAddress: address,
      });
    }
  }, [selectedPaymentMethod, cart, user, address, existingOrderId, placeOrderMutation, updateOrderMutation]);

  const handleProceed = useCallback(() => {
    if (!isAddressValid) {
      setShowAddressError(true);
      return;
    }
    if (!isPaymentSelected) {
      setError("Please select a payment method.");
      return;
    }
    if (isCOD) {
      // COD always shows confirmation modal (both new and existing order)
      setShowConfirmModal(true);
    } else {
      // Online payment: create or update order directly
      executeOrder();
    }
  }, [isAddressValid, isPaymentSelected, isCOD, executeOrder]);

  if (loadingPaymentMethods || loadingCart) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="Checkout" />
        <View style={styles.centeringContainer}>
          <Loading text="Loading..." />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.mainContainer}>
        <GeneralTopBar
          text="Checkout"
          onBackPress={existingOrderId ? () => setShowLeaveWarning(true) : undefined}
        />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.infoText}>
            Add your delivery address and select a payment method to proceed
          </Text>

          <AddressInfoSection
            address={address}
            onAddressChange={setAddress}
            isValid={isAddressValid}
            remainingChars={remainingChars}
          />

          {/* Payment Method Type Dropdown */}
          <View style={styles.paymentSection}>
            <Text style={styles.inputLabel}>Payment Method</Text>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => setShowTypeDropdown(true)}
            >
              <View style={styles.dropdownItemContent}>
                {selectedMethodType && (
                  <Image
                    source={getPaymentMethodImage(selectedMethodType)}
                    style={styles.paymentIcon}
                  />
                )}
                <Text
                  style={[
                    styles.dropdownText,
                    !selectedMethodType && styles.dropdownPlaceholder,
                  ]}
                >
                  {selectedMethodType
                    ? getPaymentMethodDisplayName(selectedMethodType)
                    : "Select payment method"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={theme.colors.text_secondary} />
            </Pressable>

            {/* Bank Account Sub-Dropdown (only shown when bank_transfer selected) */}
            {isBankTransfer && (
              <>
                <Text style={[styles.inputLabel, styles.subLabel]}>Bank Account</Text>
                <Pressable
                  style={styles.dropdownButton}
                  onPress={() => setShowBankDropdown(true)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !selectedBankMethodId && styles.dropdownPlaceholder,
                    ]}
                  >
                    {selectedBankMethodId
                      ? bankAccounts.find((b: PaymentMethod) => b.id === selectedBankMethodId)
                        ?.accountDetails?.bankName || "Selected Account"
                      : "Select bank account"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={theme.colors.text_secondary} />
                </Pressable>
              </>
            )}
          </View>

          {/* TODO: Expected delivery time calculation is pending */}
          <ExpectedDeliveryTimeSection />
          <BillingDetailsSection />
        </ScrollView>

        <View style={styles.proceedButtonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.proceedButton,
              pressed && styles.proceedButtonPressed,
              isProceedDisabled && styles.proceedButtonDisabled,
            ]}
            onPress={handleProceed}
            disabled={isProceedDisabled}>
            <Text style={styles.proceedButtonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>

      {/* Payment Method Type Selection Modal */}
      <Modal
        visible={showTypeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeDropdown(false)}
      >
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setShowTypeDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Select Payment Method</Text>
            <FlatList
              data={PAYMENT_METHOD_TYPES}
              keyExtractor={(item) => item.type}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    item.type === selectedMethodType && styles.dropdownItemSelected,
                    pressed && styles.dropdownItemPressed,
                  ]}
                  onPress={() => handleSelectType(item.type)}
                >
                  <View style={styles.dropdownItemContent}>
                    <Image
                      source={getPaymentMethodImage(item.type)}
                      style={styles.paymentIcon}
                    />
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item.type === selectedMethodType && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.type === selectedMethodType && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Bank Account Selection Modal */}
      <Modal
        visible={showBankDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBankDropdown(false)}
      >
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setShowBankDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Select Bank Account</Text>
            <FlatList
              data={bankAccounts}
              keyExtractor={(item: PaymentMethod) => item.id}
              renderItem={({ item }: { item: PaymentMethod }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    item.id === selectedBankMethodId && styles.dropdownItemSelected,
                    pressed && styles.dropdownItemPressed,
                  ]}
                  onPress={() => {
                    setSelectedBankMethodId(item.id);
                    setShowBankDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      item.id === selectedBankMethodId && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.accountDetails?.bankName || "Unknown Bank"}
                  </Text>
                  {item.id === selectedBankMethodId && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* COD Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        title="Confirm Order"
        message="Are you sure you want to place this order with Cash on Delivery?"
        confirmText="Place Order"
        cancelText="Cancel"
        onConfirm={() => {
          setShowConfirmModal(false);
          executeOrder();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Leave Warning Modal (checkout → cart when order exists) */}
      <ConfirmationModal
        visible={showLeaveWarning}
        title="Leave Checkout?"
        message="Your order has been placed but payment proof has not been uploaded yet. The order will stay pending. Are you sure you want to leave?"
        confirmText="Leave"
        cancelText="Stay"
        variant="warning"
        onConfirm={() => {
          setShowLeaveWarning(false);
          clearCartMutation.mutate();
          setExistingOrderId(null);
          setAddress("");
          setSelectedMethodType("");
          setSelectedBankMethodId("");
          setError("");
          // Clear the navigation stack so user cannot back-navigate into the abandoned checkout
          router.dismissAll();
          router.replace("/");
        }}
        onCancel={() => setShowLeaveWarning(false)}
      />

      {/* Address Error Banner */}
      {showAddressError && (
        <ErrorBanner
          title="Address Required"
          message={`Please enter a valid delivery address(minimum ${MIN_ADDRESS_LENGTH} characters).You need ${remainingChars} more character${remainingChars !== 1 ? 's' : ''}.`}
          onDismiss={() => setShowAddressError(false)}
        />
      )}

      {/* General Error Banner */}
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
  infoText: {
    fontFamily: theme.fonts.regular,
    fontSize: 10,
    color: "#fff",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  paymentSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  subLabel: {
    marginTop: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  paymentIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  dropdownPlaceholder: {
    color: theme.colors.placeholder,
  },
  // Dropdown modal styles
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    maxHeight: 400,
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.primary_light,
  },
  dropdownItemPressed: {
    backgroundColor: "#F3F4F6",
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  dropdownItemTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
  },
  proceedButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopColor: theme.colors.background,
    borderTopWidth: 1,
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonPressed: {
    opacity: 0.8,
  },
  proceedButtonDisabled: {
    backgroundColor: theme.colors.background,
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});
