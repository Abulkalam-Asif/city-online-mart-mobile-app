import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

type AddressInfoSectionProps = {
  address: string;
  onAddressChange: (newAddress: string) => void;
};

const AddressInfoSection = ({
  address,
  onAddressChange,
}: AddressInfoSectionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>Enter your Delivery Address</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Address"
        value={address}
        onChangeText={onAddressChange}
        keyboardType="default"
        maxLength={100}
        placeholderTextColor={theme.colors.placeholder}
      />
    </View>
  );
};

export default AddressInfoSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
});
