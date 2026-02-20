import OrderSuccessModal from "@/src/components/checkout-payment/payments/OrderSuccessModal";
import PaymentOption from "@/src/components/checkout-payment/payments/PaymentOption";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import { useModal } from "@/src/contexts/ModalContext";
import { useCart, useClearCart } from "@/src/hooks/useCart";
import { usePlaceOrder } from "@/src/hooks/useOrders";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGetAllPaymentMethods } from "@/src/hooks/usePaymentMethods";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Loading from "@/src/components/common/Loading";

const getDisplayName = (type: string) => {
  switch (type) {
    case "cash_on_delivery":
      return "Cash on Delivery";
    case "jazzcash":
      return "JazzCash";
    case "easypaisa":
      return "Easypaisa";
    case "bank_transfer":
      return "Bank Account";
    default:
      return type;
  }
};

export default function PaymentsScreen() {
  // Get delivery address from navigation params
  const { deliveryAddress } = useLocalSearchParams<{
    deliveryAddress?: string;
  }>();

  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isChecked, setChecked] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);

  // Modal context
  const { showModal } = useModal();

  // Fetch active payment methods
  const { data: paymentMethods, isLoading: loadingPaymentMethods } =
    useGetAllPaymentMethods();

  // Fetch cart data
  const { cart, loading: loadingCart } = useCart();
  const { user } = useAuth();

  // Clear cart mutation
  const clearCartMutation = useClearCart();

  // Place order mutation
  const placeOrderMutation = usePlaceOrder();

  // Handle successful order placement
  useEffect(() => {
    const handleOrderSuccess = async () => {
      if (placeOrderMutation.isSuccess && !cartCleared) {
        const orderId = placeOrderMutation.data;

        // Clear the cart after successful order (only once)
        clearCartMutation.mutate();
        setCartCleared(true);

        // Show success modal
        showModal("order-success", <OrderSuccessModal orderId={orderId} />);
      }
    };

    handleOrderSuccess();
  }, [
    placeOrderMutation.isSuccess,
    placeOrderMutation.data,
    cartCleared,
    screenshot,
    showModal,
    clearCartMutation,
  ]);

  // Handle order placement error
  useEffect(() => {
    if (placeOrderMutation.isError) {
      alert("There was an error placing your order. Please try again.");
    }
  }, [placeOrderMutation.isError]);

  const isProceedDisabled =
    !selectedMethod ||
    !cart ||
    cart.items.length === 0 ||
    (selectedMethod !== "Cash on Delivery" && (!isChecked || !screenshot)) ||
    placeOrderMutation.isPending;

  if (loadingPaymentMethods || loadingCart) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="Payments" />
        <View style={styles.centeringContainer}>
          <Loading text="Loading..." />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="Payments" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <Text style={styles.payWithText}>Pay with</Text>
        {
          paymentMethods?.map((method) => {
            const getImage = (type: string) => {
              switch (type) {
                case "cash_on_delivery":
                  return require("@/src/assets/icons/payments/cod.png");
                case "jazzcash":
                  return require("@/src/assets/icons/payments/jazzcash.png");
                case "easypaisa":
                  return require("@/src/assets/icons/payments/easypaisa.png");
                case "bank_transfer":
                  return require("@/src/assets/icons/payments/bank.png");
                default:
                  return require("@/src/assets/icons/payments/cod.png");
              }
            };

            const requiresScreenshot = method.type !== "cash_on_delivery";

            return (
              <PaymentOption
                key={method.id}
                name={getDisplayName(method.type)}
                image={getImage(method.type)}
                onSelect={(methodName: string) => setSelectedMethod(methodName)}
                selectedMethod={selectedMethod}
                contentHeight={requiresScreenshot ? 400 : 0}
                screenshotRequired={requiresScreenshot}
                isChecked={isChecked}
                setChecked={setChecked}
                screenshot={screenshot}
                setScreenshot={setScreenshot}>
                {method.accountDetails && (
                  <>
                    {method.accountDetails.bankName && (
                      <Text style={styles.accountText}>
                        {method.accountDetails.bankName}
                      </Text>
                    )}
                    <Text style={styles.accountText}>
                      Account Number: {method.accountDetails.accountNumber}
                    </Text>
                    <Text style={styles.accountText}>
                      Account Title: {method.accountDetails.accountTitle}
                    </Text>
                  </>
                )}
              </PaymentOption>
            );
          })
        }
      </ScrollView>

      <View style={styles.proceedButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.proceedButton,
            pressed && styles.proceedButtonPressed,
            isProceedDisabled && styles.proceedButtonDisabled,
          ]}
          onPress={async () => {
            console.log("🚀 Proceed button pressed");
            console.log("📋 Selected method:", selectedMethod);
            console.log("🛒 Cart:", cart);
            console.log("💳 Payment methods:", paymentMethods);

            if (
              !selectedMethod ||
              !paymentMethods ||
              !cart ||
              cart.items.length === 0
            ) {
              console.log("❌ Checkout validation failed");
              return;
            }

            const selectedPaymentMethod = paymentMethods.find(
              (method) => getDisplayName(method.type) === selectedMethod
            );

            if (!selectedPaymentMethod) {
              console.log("❌ Payment method not found");
              return;
            }

            console.log("✅ Starting checkout process...");

            try {
              // Now we follow the admin pattern exactly:
              // 1. Pass the local URI directly to createOrder.
              // 2. OrderService will generate the ID and handle the upload internally.
              placeOrderMutation.mutate({
                customerId: user?.uid || "anonymous",
                customerName: user?.displayName || "Guest",
                customerPhone: user?.phoneNumber || "",
                source: "mobile",
                items: cart.items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                })),
                paymentMethod: selectedPaymentMethod,
                deliveryAddress: deliveryAddress || "Address not provided",
                proofOfPaymentUri: screenshot || undefined,
              });
            } catch (error) {
              console.error("Failed to process order:", error);
              alert("Failed to process order. Please try again.");
            }
          }}
          disabled={isProceedDisabled}>
          <Text style={styles.proceedButtonText}>
            {placeOrderMutation.isPending ? "Placing Order..." : "Place Order"}
          </Text>
        </Pressable>
      </View>
    </View>
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
    gap: 12,
  },
  payWithText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
    paddingVertical: 20,
  },
  accountText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
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

  centeringContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
