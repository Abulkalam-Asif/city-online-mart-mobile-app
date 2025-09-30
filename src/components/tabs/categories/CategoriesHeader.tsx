import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { router } from "expo-router";

type CategoriesHeaderProps = {
  currentCategoryName: string;
};

const CategoriesHeader = ({ currentCategoryName }: CategoriesHeaderProps) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
        onPress={() => router.back()}>
        <FontAwesome6 name="chevron-left" size={20} />
      </Pressable>
      <Text
        style={styles.categoryNameText}
        numberOfLines={1}
        ellipsizeMode="tail">
        {currentCategoryName}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}>
        <FontAwesome6 name="magnifying-glass" size={20} />
      </Pressable>
    </View>
  );
};

export default CategoriesHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  categoryNameText: {
    fontFamily: theme.fonts.semi_bold,
    fontSize: 22,
    flex: 1,
    textAlign: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});
