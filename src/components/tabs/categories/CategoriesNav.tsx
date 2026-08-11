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
      {categories.map((category) => {
        const isSelected = currentCategoryId === category.id;
        return (
          <View
            key={category.id}
            collapsable={false}>
            <Pressable
              onPress={() => {
                setCurrentCategoryId(category.id);
              }}
              style={({ pressed }) => [
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
                pressed && styles.categoryButtonPressed,
              ]}>
              <Text
                style={[
                  styles.categoryNameText,
                  isSelected && styles.selectedCategoryText,
                ]}>
                {category.name}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default CategoriesNav;

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  containerContent: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 8,
  },

  categoryButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonPressed: {
    opacity: 0.75,
  },

  categoryNameText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },
  selectedCategoryText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.semibold,
  },
});
