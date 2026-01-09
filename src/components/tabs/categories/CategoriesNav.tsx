import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { Category } from "@/src/types";

type CategoriesNavProps = {
  categories: Category[];
  currentCategoryId: string;
  setCurrentCategoryId: (id: string) => void;
};

const CategoriesNav = ({
  categories,
  currentCategoryId,
  setCurrentCategoryId,
}: CategoriesNavProps) => {

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {categories.map((category) => (
        <View
          key={category.id}
          collapsable={false}>
          <Pressable
            onPress={() => {
              setCurrentCategoryId(category.id);
            }}
            style={({ pressed }) => [
              styles.categoryButton,
              currentCategoryId === category.id &&
              styles.categoryButtonSelected,
              pressed && styles.categoryButtonPressed,
            ]}>
            <Text
              style={[
                styles.categoryNameText,
                currentCategoryId === category.id &&
                styles.selectedCategoryText,
              ]}>
              {category.name}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
};

export default CategoriesNav;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  containerContent: {
    alignItems: "center",
    flexDirection: "row",
  },

  categoryButton: {
    paddingTop: 4,
    paddingHorizontal: 10,
  },
  categoryButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  categoryButtonPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },

  categoryNameText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text_secondary,
  },
  selectedCategoryText: {
    color: theme.colors.primary,
  },
});
