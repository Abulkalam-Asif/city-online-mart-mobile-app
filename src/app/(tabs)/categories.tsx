import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
} from "react-native";
import React, { useState, useMemo, useEffect, useRef } from "react";
import CategoriesHeader from "@/src/components/tabs/categories/CategoriesHeader";
import CategoriesNav from "@/src/components/tabs/categories/CategoriesNav";
import SubCategoriesNav from "@/src/components/tabs/categories/SubCategoriesNav";
import ProductsGrid from "@/src/components/tabs/categories/ProductsGrid";
import { PortalBottomSheet } from "@/src/components/common/PortalBottomSheet";
import BrandsMenu from "@/src/components/tabs/categories/BrandsMenu";
import SortMenu from "@/src/components/tabs/categories/SortMenu";
import { useGetAllCategoriesWithSubCategories } from "@/src/hooks/useCategories";
import {
  useInfiniteProductsByCategory,
  useInfiniteProductsBySubCategory,
} from "@/src/hooks/useProducts";
import { theme } from "@/src/constants/theme";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/react-query";
import Loading from "@/src/components/common/Loading";
import { parseCategoryId } from "@/src/types";
import { useLocalSearchParams } from "expo-router";

const CategoriesScreen = () => {
  const { categoryId: searchParamCategoryId } = useLocalSearchParams<{
    categoryId: string;
  }>();

  const queryClient = useQueryClient();

  const {
    data: categoriesData,
    isLoading: loadingCategories,
    error,
  } = useGetAllCategoriesWithSubCategories();

  const categories = useMemo(() => categoriesData || [], [categoriesData]);

  const [currentCategoryId, setCurrentCategoryId] = useState("");
  const [currentSubCategoryId, setCurrentSubCategoryId] = useState("");

  // Track if we should auto-scroll (from deep link)
  const shouldAutoScroll = useRef(false);

  useEffect(() => {
    if (searchParamCategoryId) {
      shouldAutoScroll.current = true; // Enable auto-scroll for deep link navigation
      const parsedCategoryId = parseCategoryId(searchParamCategoryId);
      // Set category and subcategory based on parsed result
      if (parsedCategoryId.isSubCategory) {
        setCurrentCategoryId(parsedCategoryId.categoryId);
        setCurrentSubCategoryId(parsedCategoryId.subCategoryId || "");
      } else {
        setCurrentCategoryId(parsedCategoryId.categoryId);
        setCurrentSubCategoryId("");
      }
    }
  }, [searchParamCategoryId]);

  // Set initial category when data loads
  useEffect(() => {
    if (categories.length > 0 && !currentCategoryId) {
      setCurrentCategoryId(categories[0].id);
      if (categories[0].subCategories?.length > 0) {
        setCurrentSubCategoryId(categories[0].subCategories[0]?.id);
      }
    }
  }, [categories, currentCategoryId]);

  const [bottomSheetType, setBottomSheetType] = useState<
    "sort" | "brands" | null
  >(null);

  const [selectedSort, setSelectedSort] = useState<string>("recommended");
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

  const handleSortApply = (sortType: string) => {
    setSelectedSort(sortType);
    setBottomSheetType(null);
  };

  const handleBrandsApply = (brands: number[]) => {
    setSelectedBrands(brands);
    setBottomSheetType(null);
  };

  // Determine if we should show subcategory products or category products
  const hasSubCategories = useMemo(() => {
    const category = categories.find((cat) => cat.id === currentCategoryId);
    return (category?.subCategories?.length ?? 0) > 0;
  }, [categories, currentCategoryId]);

  // Fetch products based on whether subcategory is selected
  const {
    data: subCategoryProductsData,
    isLoading: isLoadingSubCategoryProducts,
    error: subCategoryProductsError,
    fetchNextPage: fetchNextSubCategoryPage,
    hasNextPage: hasNextSubCategoryPage,
    isFetchingNextPage: isFetchingNextSubCategoryPage,
  } = useInfiniteProductsBySubCategory(currentCategoryId, currentSubCategoryId);

  const {
    data: categoryProductsData,
    isLoading: isLoadingCategoryProducts,
    error: categoryProductsError,
    fetchNextPage: fetchNextCategoryPage,
    hasNextPage: hasNextCategoryPage,
    isFetchingNextPage: isFetchingNextCategoryPage,
  } = useInfiniteProductsByCategory(currentCategoryId);

  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate categories
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.list({ withSubCategories: true }),
      });

      // Invalidate products based on current view
      if (hasSubCategories && currentSubCategoryId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.products.bySubCategoryInfinite(
            currentCategoryId,
            currentSubCategoryId
          ),
        });
      } else {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.products.byCategoryInfinite(currentCategoryId),
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Flatten the infinite query pages into a single array
  const products = useMemo(() => {
    if (hasSubCategories && currentSubCategoryId) {
      return (
        subCategoryProductsData?.pages.flatMap((page: any) => page.products) ||
        []
      );
    } else {
      return (
        categoryProductsData?.pages.flatMap((page: any) => page.products) || []
      );
    }
  }, [
    hasSubCategories,
    currentSubCategoryId,
    subCategoryProductsData,
    categoryProductsData,
  ]);

  // Determine loading and error states
  const isLoadingProducts = hasSubCategories
    ? isLoadingSubCategoryProducts
    : isLoadingCategoryProducts;
  const productsError = hasSubCategories
    ? subCategoryProductsError
    : categoryProductsError;

  // Handle load more
  const handleLoadMore = () => {
    if (hasSubCategories && currentSubCategoryId) {
      if (hasNextSubCategoryPage && !isFetchingNextSubCategoryPage) {
        fetchNextSubCategoryPage();
      }
    } else {
      if (hasNextCategoryPage && !isFetchingNextCategoryPage) {
        fetchNextCategoryPage();
      }
    }
  };

  // Loading state
  if (loadingCategories) {
    return <Loading text="Loading categories..." />;
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading categories</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No categories available</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[
              theme.colors.primary,
              theme.colors.secondary,
              theme.colors.error,
            ]} // Android
            tintColor={theme.colors.primary} // iOS
          />
        }>
        <View style={styles.stickyHeader}>
          <CategoriesHeader
            currentCategoryName={
              categories.find((cat) => cat.id === currentCategoryId)?.name || ""
            }
          />
          <CategoriesNav
            categories={categories}
            currentCategoryId={currentCategoryId}
            setCurrentCategoryId={setCurrentCategoryId}
            setCurrentSubCategoryId={setCurrentSubCategoryId}
            shouldAutoScroll={shouldAutoScroll}
          />
          <SubCategoriesNav
            subCategories={
              categories.find((cat) => cat.id === currentCategoryId)
                ?.subCategories || []
            }
            currentSubCategoryId={currentSubCategoryId}
            setCurrentSubCategoryId={setCurrentSubCategoryId}
            setBottomSheetType={setBottomSheetType}
            selectedSort={selectedSort}
            selectedBrands={selectedBrands}
            shouldAutoScroll={shouldAutoScroll}
          />
        </View>

        {/* Products Loading State */}
        {isLoadingProducts ? (
          <Loading text="Loading products..." />
        ) : productsError ? (
          <View style={styles.productsLoading}>
            <Text style={styles.errorText}>Error loading products</Text>
            <Text style={styles.errorDetail}>{productsError.message}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.productsLoading}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        ) : (
          <ProductsGrid
            products={products}
            selectedSort={selectedSort}
            selectedBrands={selectedBrands}
            onEndReached={handleLoadMore}
            hasNextPage={
              hasSubCategories ? hasNextSubCategoryPage : hasNextCategoryPage
            }
            isFetchingNextPage={
              hasSubCategories
                ? isFetchingNextSubCategoryPage
                : isFetchingNextCategoryPage
            }
          />
        )}
      </ScrollView>
      <PortalBottomSheet
        id="categories-filter"
        isVisible={bottomSheetType !== null}
        onClose={() => setBottomSheetType(null)}
        bottomSheetType={bottomSheetType}>
        {bottomSheetType === "sort" ? (
          <SortMenu selectedSort={selectedSort} onApply={handleSortApply} />
        ) : bottomSheetType === "brands" ? (
          <BrandsMenu
            selectedBrands={selectedBrands}
            onApply={handleBrandsApply}
          />
        ) : null}
      </PortalBottomSheet>
    </>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  containerContent: {
    paddingBottom: 60,
  },
  stickyHeader: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  productsLoading: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
