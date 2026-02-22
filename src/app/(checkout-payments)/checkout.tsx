import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import ExpectedDeliveryTimeSection from "@/src/components/checkout-payment/checkout/ExpectedDeliveryTimeSection";
import BillingDetailsSection from "@/src/components/checkout-payment/checkout/BillingDetailsSection";
import { router } from "expo-router";
import AddressInfoSection from "@/src/components/checkout-payment/checkout/AddressInfoSection";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import { CONSTANTS } from "@/src/constants/constants";

export default function CheckoutScreen() {
  const [address, setAddress] = useState("");
  const [showAddressError, setShowAddressError] = useState(false);

  // Check if address is valid (not empty and has minimum length)
  const MIN_ADDRESS_LENGTH = CONSTANTS.checkout.addressMinLength;
  const isAddressValid = address.trim().length >= MIN_ADDRESS_LENGTH;
  const remainingChars = MIN_ADDRESS_LENGTH - address.trim().length;

  const handleProceed = useCallback(() => {
    if (!isAddressValid) {
      setShowAddressError(true);
      return;
    }
    // Pass address to payments screen
    router.push({
      pathname: "/payments",
      params: { deliveryAddress: address }
    });
  }, [address, isAddressValid]);

  return (
    <>
      <View style={styles.mainContainer}>
        <GeneralTopBar text="Checkout" />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.infoText}>
            Add your delivery address,so that order can be provided to you at good
            time
          </Text>
          <AddressInfoSection
            address={address}
            onAddressChange={setAddress}
            isValid={isAddressValid}
            remainingChars={remainingChars}
          />
          {/* TODO: Expected delivery time calculation is pending */}
          <ExpectedDeliveryTimeSection />
          <BillingDetailsSection />
        </ScrollView>
        <View style={styles.proceedButtonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.proceedButton,
              pressed && styles.proceedButtonPressed,
            ]}
            onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>
              Proceed to Payments
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Error Banner */}
      {showAddressError && (
        <ErrorBanner
          title="Address Required"
          message={`Please enter a valid delivery address (minimum ${MIN_ADDRESS_LENGTH} characters). You need ${remainingChars} more character${remainingChars !== 1 ? 's' : ''}.`}
          onDismiss={() => setShowAddressError(false)}
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
  proceedButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});
