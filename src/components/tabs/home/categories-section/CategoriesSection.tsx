import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { useGetValidCategoryDiscounts } from "@/src/hooks/useDiscounts";
import React from "react";
import CategoryCard from "./CategoryCard";
import { theme } from "@/src/constants/theme";
import { useGetCategoriesForHomepage } from "@/src/hooks/useCategories";
import Loading from "@/src/components/common/Loading";
import { router } from "expo-router";
import { getResponsiveValue } from "@/src/utils/getResponsiveValue";

const CategoriesSection = () => {
  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorGettingCategories,
  } = useGetCategoriesForHomepage();

  const { data: categoryDiscounts } = useGetValidCategoryDiscounts();

  // In case of error, we simply don't render the section
  if (errorGettingCategories) {
    return null;
  }

  // Show loading state
  if (loadingCategories) {
    return <Loading />;
  }

  // If no categories, don't render the section
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
        <TouchableOpacity
          onPress={() => {
            router.push("/categories");
          }}
          activeOpacity={0.8}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categoryColumns.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map((category) => {
              const discount = categoryDiscounts?.find(
                (d) => d.id === category.discountId
              );
              return (
                <CategoryCard
                  key={category.id}
                  imageSource={category.image}
                  name={category.name}
                  backgroundColor={theme.colors.background_2}
                  id={category.id}
                  discountPercentage={discount?.percentage}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default React.memo(CategoriesSection);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    paddingTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 16,
  },
  column: {
    flexDirection: "column",
    gap: getResponsiveValue(4, 16),
    width: getResponsiveValue(
      (width) => (width - 80) / 3.25, // 3.25 cards in view
      (width) => (width - 112) / 6 // 7 cards in view
    ),
  },
});
