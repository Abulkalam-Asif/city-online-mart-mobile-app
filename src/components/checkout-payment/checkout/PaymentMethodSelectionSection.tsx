import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { router } from "expo-router";

const PaymentMethodSelectionSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.paymentMethodText}>Payment Method</Text>
        <Pressable
          style={({ pressed }) => [
            pressed && styles.changePaymentMethodButtonPressed,
          ]}
          onPress={() => router.push("/payments")}>
          <Text style={styles.changePaymentMethodButtonText}>
            Change Payment Method
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PaymentMethodSelectionSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentMethodText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },
  changePaymentMethodButtonPressed: {
    opacity: 0.7,
  },
  changePaymentMethodButtonText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },

  timeDateContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  dateText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
  },
  image: {
    width: 60,
    height: 60,
  },
});
