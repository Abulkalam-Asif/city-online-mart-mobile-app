import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import PaymentOption from "@/src/components/checkout-payment/payments/PaymentOption";

export default function PaymentsScreen() {
  const [selectedMethod, setSelectedMethod] =
    useState<string>("Cash on Delivery");
  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="Payments" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <Text style={styles.payWithText}>Pay with</Text>
        <PaymentOption
          name="Cash on Delivery"
          image={require("@/src/assets/icons/payments/cod.png")}
          onSelect={(method: string) => setSelectedMethod(method)}
          selectedMethod={selectedMethod}
        />
        <PaymentOption
          name="JazzCash"
          image={require("@/src/assets/icons/payments/jazzcash.png")}
          onSelect={(method: string) => setSelectedMethod(method)}
          selectedMethod={selectedMethod}
          contentHeight={60}>
          <Text style={styles.accountText}>Account Number: 123456789</Text>
          <Text style={styles.accountText}>Account Title: John Doe</Text>
        </PaymentOption>
        <PaymentOption
          name="Easypaisa"
          image={require("@/src/assets/icons/payments/easypaisa.png")}
          onSelect={(method: string) => setSelectedMethod(method)}
          selectedMethod={selectedMethod}
          contentHeight={60}>
          <Text style={styles.accountText}>Account Number: 123456789</Text>
          <Text style={styles.accountText}>Account Title: John Doe</Text>
        </PaymentOption>
        <PaymentOption
          name="Bank Account"
          image={require("@/src/assets/icons/payments/bank.png")}
          onSelect={(method: string) => setSelectedMethod(method)}
          selectedMethod={selectedMethod}
          contentHeight={100}>
          <Text style={styles.accountText}>Meezan Bank</Text>
          <Text style={styles.accountText}>Account Number: 123456789</Text>
          <Text style={styles.accountText}>Account Title: John Doe</Text>
        </PaymentOption>
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
    gap: 16,
  },
  payWithText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },
  accountText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
});
