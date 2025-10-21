import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

type SettingsButtonProps = {
  text: string;
  icon: React.ReactNode;
  iconBgColor: string;
  pressHandler: () => void;
  children?: React.ReactNode;
};

const SettingsButton = ({
  text,
  icon,

  iconBgColor,
  children,
  pressHandler,
}: SettingsButtonProps) => {
  return (
    <Pressable
      onPress={pressHandler}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <View style={[styles.imageContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <Text style={styles.text}>{text}</Text>
      {children}
    </Pressable>
  );
};

export default SettingsButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: 30,
    height: 30,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 16,
    height: 16,
  },
  text: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  icon: {
    marginLeft: "auto",
    marginRight: 8,
  },
});
