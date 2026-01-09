import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "@/src/constants/theme";
import { SubCategory } from "@/src/types";
import SortButton from "./SortButton";
import BrandsButton from "./BrandsButton";
import Loading from "../../common/Loading";
import ErrorBanner from "../../common/ErrorBanner";
import { queryClient, queryKeys } from "@/src/lib/react-query";

type SubCategoriesNavProps = {
  subCategories: SubCategory[] | undefined;
  loadingSubCategories: boolean;
  errorGettingSubCategories: Error | null;
  parentCategoryId: string;
  currentSubCategoryId: string;
  setCurrentSubCategoryId: (id: string) => void;
  setBottomSheetType: (type: "sort" | "brands" | null) => void;
  selectedSort: string;
  selectedBrands: number[];
};

const SubCategoriesNav = ({
  subCategories,
  loadingSubCategories,
  errorGettingSubCategories,
  parentCategoryId,
  currentSubCategoryId,
  setCurrentSubCategoryId,
  setBottomSheetType,
  selectedSort,
  selectedBrands,
}: SubCategoriesNavProps) => {
  const [dismissedError, setDismissedError] = useState(false);

  // Reset error when parent category changes
  useEffect(() => {
    setDismissedError(false);
  }, [parentCategoryId]);


  if (errorGettingSubCategories && !dismissedError) {
    return (
      <ErrorBanner
        title="Unable to Load Subcategories"
        message="Error loading subcategories. Please try again."
        onDismiss={() => setDismissedError(true)}
        onRetry={async () => {
          // Invalidate the query to refetch categories for navbar (useGetCategoriesForNavbar)
          await queryClient.invalidateQueries({
            queryKey: queryKeys.subCategories.byParentCategory(
              parentCategoryId,
              { isActive: true, showOnNavbar: true }
            ),
          });
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SortButton
        onPress={() => setBottomSheetType("sort")}
        selectedSort={selectedSort}
      />
      <BrandsButton
        onPress={() => setBottomSheetType("brands")}
        selectedBrands={selectedBrands}
      />
      <ScrollView
        contentContainerStyle={[styles.containerContent, loadingSubCategories && { width: "100%" }]}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {loadingSubCategories ? (
          <View style={styles.subCategoriesLoadingContainer}>
            <Loading size={"small"} />
          </View>
        ) : (
          subCategories &&
          subCategories.map((subCategory) => (
            <View
              key={subCategory.id}
              collapsable={false}>
              <Pressable
                onPress={() => setCurrentSubCategoryId(subCategory.id)}
                style={({ pressed }) => [
                  styles.subCategoryButton,
                  currentSubCategoryId === subCategory.id &&
                  styles.subCategoryButtonSelected,
                  pressed && styles.subCategoryButtonPressed,
                ]}>
                <Text
                  style={[
                    styles.subCategoryNameText,
                    currentSubCategoryId === subCategory.id &&
                    styles.selectedSubCategoryText,
                  ]}>
                  {subCategory.name}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SubCategoriesNav;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  containerContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  subCategoriesLoadingContainer: {
    width: "100%",
    justifyContent: "center",
  },
  subCategoriesErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  subCategoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F6F7FB",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  subCategoryButtonSelected: {
    borderColor: theme.colors.primary,
  },
  subCategoryButtonPressed: {
    opacity: 0.7,
  },

  subCategoryNameText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: "rgba(0, 0, 0, 0.5)",
  },
  selectedSubCategoryText: {
    color: theme.colors.primary,
  },
});
