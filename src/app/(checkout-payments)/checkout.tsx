import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import ExpectedDeliveryTimeSection from "@/src/components/checkout-payment/checkout/ExpectedDeliveryTimeSection";
import PaymentMethodSelectionSection from "@/src/components/checkout-payment/checkout/PaymentMethodSelectionSection";

export default function CheckoutScreen() {
  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="Checkout" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <Text style={styles.infoText}>
          Add your delivery address,so that order can be provided to you at good
          time
        </Text>
        <ExpectedDeliveryTimeSection />
        <PaymentMethodSelectionSection />
      </ScrollView>
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
});
