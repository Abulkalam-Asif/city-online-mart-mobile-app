import { Pressable, StyleSheet, Text } from "react-native";
import React from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { ProductSortType } from "@/src/types";
import { sortOptions } from "./SortMenu";

type SortButtonProps = {
  onPress: () => void;
  selectedSort: ProductSortType;
};

const SortButton = ({ onPress, selectedSort }: SortButtonProps) => {
  const isActive = selectedSort !== "default";
  const label = isActive
    ? sortOptions.find((option) => option.id === selectedSort)?.label ?? "Sort"
    : "Sort";
  const color = isActive ? theme.colors.primary : "rgba(0, 0, 0, 0.5)";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isActive && styles.buttonActive,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}>
      <FontAwesome6
        name="arrow-right-arrow-left"
        size={16}
        color={color}
        style={styles.icon}
      />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
};

export default SortButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  buttonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary_light,
  },
  buttonPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  icon: {
    transform: [{ rotate: "1.5708rad" }], // 90 degrees in radians
    width: 16,
    height: 16,
  },
  label: {
    fontSize: 12,
    lineHeight: 16, // same as the icon, so the button keeps its old height
    fontFamily: theme.fonts.medium,
  },
});
