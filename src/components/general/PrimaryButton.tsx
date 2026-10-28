import { Pressable, StyleSheet, Text } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean; // faded and not pressable
  dimmed?: boolean; // faded but still pressable (the press explains what is missing)
};

// The big green button used in screen footers (Proceed to Checkout, Place Order, ...).
// Faded keeps the green but lowers its opacity, so the white text stays readable.
const PrimaryButton = ({ label, onPress, disabled = false, dimmed = false }: PrimaryButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        (disabled || dimmed) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});
