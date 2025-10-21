import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { ICategory, IProduct } from "@/src/types";

type CategoriesNavProps = {
  categories: {
    Category: ICategory;
    Products: IProduct[];
    SubCategories: ICategory[];
  }[];
  currentCategoryId: number;
  setCurrentCategoryId: (id: number) => void;
  setCurrentSubCategoryId: (id: number) => void;
};

const CategoriesNav = ({
  categories,
  currentCategoryId,
  setCurrentCategoryId,
  setCurrentSubCategoryId,
}: CategoriesNavProps) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {categories.map((category) => (
        <Pressable
          key={category.Category.Id}
          onPress={() => {
            setCurrentCategoryId(category.Category.Id);
            setCurrentSubCategoryId(category.SubCategories[0].Id);
          }}
          style={({ pressed }) => [
            styles.categoryButton,
            currentCategoryId === category.Category.Id &&
              styles.categoryButtonSelected,
            pressed && styles.categoryButtonPressed,
          ]}>
          <Text
            style={[
              styles.categoryNameText,
              currentCategoryId === category.Category.Id &&
                styles.selectedCategoryText,
            ]}>
            {category.Category.Name}
          </Text>
        </Pressable>
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
