import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { FontAwesome6 } from "@expo/vector-icons";

type SortButtonProps = {
  onPress: () => void;
  selectedSort: string;
};

const SortButton = ({ onPress, selectedSort }: SortButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}>
      <FontAwesome6
        name="arrow-right-arrow-left"
        size={16}
        color="rgba(0, 0, 0, 0.5)"
        style={styles.icon}
      />
    </Pressable>
  );
};

export default SortButton;

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  buttonPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  icon: {
    transform: [{ rotate: "1.5708rad" }], // 90 degrees in radians
    width: 16,
    height: 16,
  },
});
