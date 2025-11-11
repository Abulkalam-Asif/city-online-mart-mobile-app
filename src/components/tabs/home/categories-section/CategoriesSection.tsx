import { StyleSheet, View, ScrollView, Text, Pressable } from "react-native";
import React from "react";
import CategoryCard, { CategoryCardLoading } from "./CategoryCard";
import { theme } from "@/src/constants/theme";
import { useGetCategoriesForHomepage } from "@/src/hooks/useCategories";
import Loading from "@/src/components/common/Loading";

const CategoriesSection = () => {
  const {
    data: categories,
    isLoading: loadingCategories,
    error,
  } = useGetCategoriesForHomepage();

  if (!categories || categories.length === 0) {
    return null;
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
      {loadingCategories ? (
        <Loading />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {categoryColumns.map((column, columnIndex) => (
            <View key={columnIndex} style={styles.column}>
              {column.map((category) => (
                <CategoryCard
                  key={category.id}
                  imageSource={category.image}
                  name={category.name}
                  backgroundColor={theme.colors.background_2}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
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
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitleText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: theme.fonts.semibold,
  },
  viewAllText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.secondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 24,
  },
  column: {
    flexDirection: "column",
    gap: 16,
  },
});
