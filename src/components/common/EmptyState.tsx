import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import RetryButton from "./RetryButton";

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  /** Shows a button under the text (for example "Retry" or "Start Shopping"). */
  actionText?: string;
  onAction?: () => void;
  /** "error" uses a red icon, "empty" (default) a green one. */
  tone?: "empty" | "error";
  /** Smaller version for use inside cards and dropdowns. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * One look for "nothing here" and "could not load" across the app: icon, title, short message
 * and an optional button.
 */
const EmptyState = ({
  icon,
  title,
  message,
  actionText,
  onAction,
  tone = "empty",
  compact = false,
  style,
}: EmptyStateProps) => {
  const isError = tone === "error";
  const iconName = icon ?? (isError ? "cloud-offline-outline" : "file-tray-outline");
  const iconSize = compact ? 26 : 40;

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View
        style={[
          styles.iconCircle,
          compact && styles.iconCircleCompact,
          { backgroundColor: isError ? theme.colors.error_light : theme.colors.primary_light },
        ]}>
        <Ionicons
          name={iconName}
          size={iconSize}
          color={isError ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text>
      ) : null}
      {actionText && onAction ? (
        <RetryButton
          text={actionText}
          onPress={onAction}
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  containerCompact: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconCircleCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  titleCompact: {
    fontSize: 14,
  },
  message: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    textAlign: "center",
    lineHeight: 19,
  },
  messageCompact: {
    fontSize: 12,
    lineHeight: 17,
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 28,
  },
});
