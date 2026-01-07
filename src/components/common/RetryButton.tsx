import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

interface RetryButtonProps
  extends Omit<React.ComponentProps<typeof Pressable>, "style"> {
  style?: StyleProp<ViewStyle>;
  text?: string;
}
const RetryButton = ({ style, text = "Retry", ...props }: RetryButtonProps) => {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style,
      ]}>
      <Text style={styles.buttonText}>{text}</Text>
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
