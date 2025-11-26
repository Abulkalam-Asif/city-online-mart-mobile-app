import OrderSuccessModal from "@/src/components/checkout-payment/payments/OrderSuccessModal";
import PaymentOption from "@/src/components/checkout-payment/payments/PaymentOption";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import { useModal } from "@/src/contexts/ModalContext";
import { useCart, useClearCart } from "@/src/hooks/useCart";
import { usePlaceOrder } from "@/src/hooks/useOrders";
import { useGetActivePaymentMethods } from "@/src/hooks/usePaymentMethods";
import { updateOrderWithPaymentProof, uploadPaymentProof } from "@/src/utils/uploadPaymentProof";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const mockCustomerId = "customer123"; // In real app, get from auth context
const mockDeliveryAddress = "123 Test Street, Test City"; // In real app, from checkout form

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
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isChecked, setChecked] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);

  // Modal context
  const { showModal } = useModal();

  // Fetch active payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useGetActivePaymentMethods();

  // Fetch cart data
  const { data: cart, isLoading: cartLoading } = useCart();

  // Clear cart mutation
  const clearCartMutation = useClearCart();

  // Place order mutation
  const placeOrderMutation = usePlaceOrder();

  // Handle successful order placement
  useEffect(() => {
    const handleOrderSuccess = async () => {
      if (placeOrderMutation.isSuccess && !cartCleared) {
        const orderId = placeOrderMutation.data;

        // Upload payment proof if screenshot exists
        if (screenshot) {
          try {
            const downloadUrl = await uploadPaymentProof(screenshot, orderId);
            await updateOrderWithPaymentProof(orderId, downloadUrl);
          } catch (error) {
            console.error('Failed to upload payment proof:', error);
            // Don't fail the order for upload errors - order is already placed
          }
        }

        // Clear the cart after successful order (only once)
        clearCartMutation.mutate();
        setCartCleared(true);

        // Show success modal
        showModal("order-success", <OrderSuccessModal orderId={orderId} />);
      }
    };

    handleOrderSuccess();
  }, [placeOrderMutation.isSuccess, placeOrderMutation.data, cartCleared, screenshot, showModal]);

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

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="Payments" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <Text style={styles.payWithText}>Pay with</Text>
        {(paymentMethodsLoading || cartLoading) ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
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
                      <Text style={styles.accountText}>{method.accountDetails.bankName}</Text>
                    )}
                    <Text style={styles.accountText}>Account Number: {method.accountDetails.accountNumber}</Text>
                    <Text style={styles.accountText}>Account Title: {method.accountDetails.accountTitle}</Text>
                  </>
                )}
              </PaymentOption>
            );
          })
        )}
      </ScrollView>

      <View style={styles.proceedButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.proceedButton,
            pressed && styles.proceedButtonPressed,
            isProceedDisabled && styles.proceedButtonDisabled,
          ]}
          onPress={() => {
            if (!selectedMethod || !paymentMethods || !cart || cart.items.length === 0) return;

            const selectedPaymentMethod = paymentMethods.find(
              (method) => getDisplayName(method.type) === selectedMethod
            );

            if (!selectedPaymentMethod) return;

            // Convert cart items to order items format
            const orderItems = cart.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: 0, // Could be calculated from product discounts
              subtotal: item.unitPrice * item.quantity,
              batchId: item.batchId,
            }));

            // Calculate order totals
            const subtotal = cart.total;
            const discount = 0; // In real app, calculate from order-level discounts
            const deliveryFee = 100; // In real app, calculate based on location/delivery options
            const total = subtotal + deliveryFee - discount;

            placeOrderMutation.mutate({
              customerId: mockCustomerId,
              items: orderItems,
              subtotal,
              discount,
              deliveryFee,
              total,
              paymentMethod: selectedPaymentMethod,
              deliveryAddress: mockDeliveryAddress,
              proofOfPaymentUrl: undefined, // Will be uploaded after order placement
            });
          }}
          disabled={isProceedDisabled}>
          <Text style={styles.proceedButtonText}>
            {placeOrderMutation.isPending ? "Placing Order..." : "Proceed"}
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
});
