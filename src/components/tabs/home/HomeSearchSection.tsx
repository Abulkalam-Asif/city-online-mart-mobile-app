import { Pressable, StyleSheet, TextInput, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";

type HomeSearchSectionProps = {
  openSidebarHandler: () => void;
};

const HomeSearchSection: React.FC<HomeSearchSectionProps> = ({
  openSidebarHandler,
}: HomeSearchSectionProps) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
        onPress={openSidebarHandler}>
        <FontAwesome6 name="bars" size={20} color={"#fff"} />
      </Pressable>
      <TextInput placeholder="Search the store" style={styles.textInput} />
      <Pressable
        style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}>
        <FontAwesome6 name="bell" size={20} color={"#fff"} />
      </Pressable>
    </View>
  );
};

export default HomeSearchSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
