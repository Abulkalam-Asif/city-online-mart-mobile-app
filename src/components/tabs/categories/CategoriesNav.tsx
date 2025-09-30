import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { ICategory, IProduct } from "@/src/types";

type CategoriesNavProps = {
  categories: {
    Category: ICategory;
    Products: IProduct[];
  }[];
  currentCategory: {
    Category: ICategory;
    Products: IProduct[];
  };
  setCurrentCategory: (category: {
    Category: ICategory;
    Products: IProduct[];
  }) => void;
};

const CategoriesNav = ({
  categories,
  currentCategory,
  setCurrentCategory,
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
          onPress={() => setCurrentCategory(category)}
          style={({ pressed }) => [
            styles.categoryButton,
            currentCategory.Category.Id === category.Category.Id &&
              styles.selectedCategory,
            pressed && styles.categoryButtonPressed,
          ]}>
          <Text
            style={[
              styles.categoryNameText,
              currentCategory.Category.Id === category.Category.Id
                ? styles.selectedCategoryText
                : styles.unselectedCategoryNameText,
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.placeholder,
  },

  selectedCategory: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  categoryButton: {
    paddingTop: 4,
    paddingHorizontal: 10,
  },
  categoryButtonPressed: {
    backgroundColor: theme.colors.primary_light,
  },
  categoryNameText: {
    fontSize: 12,
    fontFamily: theme.fonts.semi_bold,
  },
  unselectedCategoryNameText: {
    color: theme.colors.text_secondary,
  },
  selectedCategoryText: {
    color: theme.colors.primary,
  },
});
