import { StyleSheet, View, ScrollView, Text, Pressable } from "react-native";
import React from "react";
import CategoryCard, { CategoryCardLoading } from "./CategoryCard";
import { ICategory } from "@/src/types";
import { theme } from "@/src/constants/theme";

type CategoriesSectionProps = {
  categories: ICategory[] | undefined;
  loadingCategories: boolean;
};

const CategoriesSection = ({
  categories,
  loadingCategories,
}: CategoriesSectionProps) => {
  if (loadingCategories) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitleText}>Our Best Prices</Text>
        {Array.from({ length: 2 }).map((_, index) => (
          <View key={index} style={styles.scrollContent}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <CategoryCardLoading key={idx} />
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No categories found. Data: {JSON.stringify(categories)}</Text>
      </View>
    );
  }

  const getColumnsFromCategories = () => {
    const columns = [];
    for (let i = 0; i < categories.length; i += 2) {
      columns.push(categories.slice(i, i + 2));
    }
    return columns;
  };

  const categoryColumns = getColumnsFromCategories();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleText}>Categories</Text>
        <Pressable onPress={() => {}}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categoryColumns.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map((category) => (
              <CategoryCard
                key={category.Id}
                imageSource={category.PictureUrl}
                name={category.Name}
                backgroundColor={
                  theme.light_colors[
                    Math.floor(Math.random() * theme.light_colors.length)
                  ]
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoriesSection;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitleText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: theme.fonts.semi_bold,
  },
  viewAllText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.secondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 20,
  },
  column: {
    flexDirection: "column",
    gap: 20,
  },
});
