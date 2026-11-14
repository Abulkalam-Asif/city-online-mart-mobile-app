import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/src/constants/theme";

export type TopToastMessage = {
  /** New id for every press, so the same text shown twice slides in twice. */
  id: number;
  message: string;
};

type TopToastProps = {
  toast: TopToastMessage | null;
  onHide: () => void;
  /** How long it stays before sliding back up, in ms. */
  duration?: number;
};

const HIDDEN_Y = -140;

/**
 * A small message that slides down from the top of the screen and goes away by itself. For "you
 * missed something" hints that should not interrupt the customer with a popup. Render it inside the
 * screen's root view (it is absolutely positioned above everything else).
 */
const TopToast = ({ toast, onHide, duration = 3500 }: TopToastProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;

  useEffect(() => {
    if (!toast) return;
    translateY.setValue(HIDDEN_Y);
    Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(translateY, { toValue: HIDDEN_Y, duration: 200, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) onHide();
        },
      );
    }, duration);
    return () => {
      clearTimeout(timer);
      translateY.stopAnimation();
    };
  }, [toast, duration, onHide, translateY]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.container, { top: insets.top + 8, transform: [{ translateY }] }]}>
      <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
};

export default TopToast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
});
