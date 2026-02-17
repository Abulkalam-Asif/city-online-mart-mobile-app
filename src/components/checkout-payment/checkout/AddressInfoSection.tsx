import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

type AddressInfoSectionProps = {
  address: string;
  onAddressChange: (newAddress: string) => void;
  isValid: boolean;
  remainingChars: number;
};

const AddressInfoSection = ({
  address,
  onAddressChange,
  isValid,
  remainingChars,
}: AddressInfoSectionProps) => {
  const showFeedback = address.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>Enter your Delivery Address</Text>
        {showFeedback && (
          <Text style={[
            styles.charCount,
            isValid ? styles.charCountValid : styles.charCountInvalid
          ]}>
            {isValid ? '' : `${remainingChars} more needed`}
          </Text>
        )}
      </View>
      <TextInput
        style={[
          styles.textInput,
          showFeedback && !isValid && styles.textInputInvalid,
          showFeedback && isValid && styles.textInputValid,
        ]}
        placeholder="Enter your full delivery address"
        value={address}
        onChangeText={onAddressChange}
        keyboardType="default"
        maxLength={200}
        multiline
        numberOfLines={3}
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  charCount: {
    fontSize: 10,
    fontFamily: theme.fonts.medium,
  },
  charCountValid: {
    color: theme.colors.primary,
  },
  charCountInvalid: {
    color: theme.colors.text_secondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  textInputInvalid: {
    borderColor: theme.colors.text_secondary,
  },
  textInputValid: {
    borderColor: theme.colors.primary,
  },
});
