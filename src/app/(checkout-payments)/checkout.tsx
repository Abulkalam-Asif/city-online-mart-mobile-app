import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import ExpectedDeliveryTimeSection from "@/src/components/checkout-payment/checkout/ExpectedDeliveryTimeSection";
import BillingDetailsSection from "@/src/components/checkout-payment/checkout/BillingDetailsSection";
import { router } from "expo-router";
import AddressInfoSection from "@/src/components/checkout-payment/checkout/AddressInfoSection";

export default function CheckoutScreen() {
  const [address, setAddress] = useState("");

  // Check if address is valid (not empty and has minimum length)
  const isAddressValid = address.trim().length >= 5;

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
        <AddressInfoSection address={address} onAddressChange={setAddress} />
        <ExpectedDeliveryTimeSection />
        <BillingDetailsSection />
      </ScrollView>
      <View style={styles.proceedButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.proceedButton,
            !isAddressValid && styles.proceedButtonDisabled,
            pressed && isAddressValid && styles.proceedButtonPressed,
          ]}
          onPress={() => {
            if (!isAddressValid) {
              alert("Please enter a valid delivery address (minimum 10 characters)");
              return;
            }
            // Pass address to payments screen
            router.push({
              pathname: "/payments",
              params: { deliveryAddress: address }
            });
          }}
          disabled={!isAddressValid}>
          <Text style={[
            styles.proceedButtonText,
            !isAddressValid && styles.proceedButtonTextDisabled
          ]}>
            Proceed to Payments
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
  proceedButtonTextDisabled: {
    color: theme.colors.text_secondary,
  },
});
