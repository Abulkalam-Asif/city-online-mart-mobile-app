import { Pressable, StyleSheet, Text } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

const RetryButton = ({ ...props }: React.ComponentProps<typeof Pressable>) => {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <Text style={styles.buttonText}>Retry</Text>
    </Pressable>
  );
};

export default RetryButton;

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
