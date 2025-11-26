import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/src/constants/theme";
import { useModal } from "@/src/contexts/ModalContext";
import { router } from "expo-router";

type OrderSuccessModalProps = {
  orderId: string;
};

const OrderSuccessModal = ({ orderId }: OrderSuccessModalProps) => {
  const { hideModal } = useModal();

  const handleViewOrders = () => {
    hideModal("order-success");
    router.push("/profile/orders");
  };

  const handleContinueShopping = () => {
    hideModal("order-success");
    router.push("/home");
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.iconContainer}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.message}>
          Your order has been placed and is being processed.
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={handleContinueShopping}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Continue Shopping
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleViewOrders}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              View Orders
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },
  primaryButtonText: {
    color: "#fff",
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
});

export default OrderSuccessModal;