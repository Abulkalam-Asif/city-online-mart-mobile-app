import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
  shouldAutoScroll?: React.RefObject<boolean>;
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
  shouldAutoScroll,
}: SubCategoriesNavProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemRefs = useRef<{ [key: string]: View | null }>({});
  const [dismissedError, setDismissedError] = useState(false);

  // Reset error when parent category changes
  useEffect(() => {
    setDismissedError(false);
  }, [parentCategoryId]);

  // Auto-scroll to selected subcategory (only when from deep link)
  useEffect(() => {
    if (
      shouldAutoScroll?.current &&
      currentSubCategoryId &&
      scrollViewRef.current
    ) {
      const selectedItemRef = itemRefs.current[currentSubCategoryId];

      if (selectedItemRef) {
        // Longer delay for subcategories to ensure layout is complete
        setTimeout(() => {
          selectedItemRef.measureLayout(
            scrollViewRef.current as any,
            (x, y, width, height) => {
              // Scroll to position the item at the left edge
              // Add small offset (10px) for visual breathing room
              scrollViewRef.current?.scrollTo({
                x: Math.max(0, x - 10),
                animated: true,
              });
            },
            () => { }
          );
        }, 300); // Increased delay for subcategories

        // Reset flag after scrolling
        shouldAutoScroll.current = false;
      }
    }
  }, [currentSubCategoryId, subCategories, shouldAutoScroll]);

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
        ref={scrollViewRef}
        contentContainerStyle={styles.containerContent}
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
              ref={(ref) => {
                itemRefs.current[subCategory.id] = ref;
              }}
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
    width: "100%",
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
