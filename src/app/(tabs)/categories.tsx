import {
  FlatList,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import CategoriesHeader from "@/src/components/tabs/categories/CategoriesHeader";
import CategoriesNav from "@/src/components/tabs/categories/CategoriesNav";
import SubCategoriesNav from "@/src/components/tabs/categories/SubCategoriesNav";
import { PortalBottomSheet } from "@/src/components/common/PortalBottomSheet";
import BrandsMenu from "@/src/components/tabs/categories/BrandsMenu";
import SortMenu from "@/src/components/tabs/categories/SortMenu";
import {
  useGetCategoriesForNavbar,
  useGetSubCategoriesByCategoryIdForNavbar,
} from "@/src/hooks/useCategories";
import { theme } from "@/src/constants/theme";
import Loading from "@/src/components/common/Loading";
import { useLocalSearchParams } from "expo-router";
import { queryClient, queryKeys } from "@/src/lib/react-query";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import {
  useGetInfiniteProductsBySpecialCategory,
  useGetInfiniteProductsBySubCategory,
} from "@/src/hooks/useProducts";
import { Product, ProductSortType } from "@/src/types";
import ProductCard from "@/src/components/tabs/home/ProductCard";
import { getResponsiveValue } from "@/src/utils/getResponsiveValue";
import RetryButton from "@/src/components/common/RetryButton";
import { useCart } from "@/src/hooks/useCart";
import { CONSTANTS } from "@/src/constants/constants";

const CategoriesScreen = () => {
  // Get category and subcategory from URL params (if any)
  const {
    categoryId: searchParamCategoryId,
    subCategoryId: searchParamSubCategoryId,
  } = useLocalSearchParams<{
    categoryId?: string;
    subCategoryId?: string;
  }>();

  // Fetch categories for navbar
  const {
    data: categoriesForNavbarData,
    isLoading: loadingCategoriesForNavbar,
    error: errorGettingCategoriesForNavbar,
  } = useGetCategoriesForNavbar();

  // Memoize categories for navbar
  const categories = useMemo(
    () => categoriesForNavbarData || [],
    [categoriesForNavbarData]
  );

  const [currentCategoryId, setCurrentCategoryId] = useState(
    searchParamCategoryId || ""
  );

  const [currentSubCategoryId, setCurrentSubCategoryId] = useState(
    searchParamSubCategoryId || ""
  );

  // Get cart data
  const { data: cart } = useCart();

  // Derive currentCategory from categories array
  const currentCategory = categories.find(
    (cat) => cat.id === currentCategoryId
  );

  // Simple categories have subcategories, special categories don't, and some simple categories can currently have 0 sub-categories
  const hasSubCategories =
    currentCategory &&
    currentCategory.subCategoryCount > 0 &&
    currentCategory.type === "simple";

  // Only fetch subcategories for "simple" type categories that currently have subcategories
  const {
    data: subCategoriesForNavbarData,
    isLoading: loadingSubCategoriesForNavbar,
    error: errorGettingSubCategoriesForNavbar,
  } = useGetSubCategoriesByCategoryIdForNavbar(
    currentCategoryId,
    !!hasSubCategories
  );

  useEffect(() => {
    if (searchParamCategoryId) {
      // Set category ID and subcategory ID from URL params
      setCurrentCategoryId(searchParamCategoryId || "");
      setCurrentSubCategoryId(searchParamSubCategoryId || "");
    }
  }, [searchParamCategoryId, searchParamSubCategoryId]);

  // Set initial category when data loads
  useEffect(() => {
    if (categories.length > 0 && !currentCategoryId) {
      setCurrentCategoryId(categories[0].id);
    }
  }, [categories, currentCategoryId]);

  // Set initial subcategory when subcategories load or category changes
  useEffect(() => {
    // Skip if coming from deep link with a specific subcategory
    if (searchParamSubCategoryId) return;

    // Set first subcategory if available, otherwise reset to empty
    if (subCategoriesForNavbarData && subCategoriesForNavbarData.length > 0) {
      setCurrentSubCategoryId(subCategoriesForNavbarData[0].id);
    } else {
      setCurrentSubCategoryId("");
    }
  }, [subCategoriesForNavbarData, currentCategoryId, searchParamSubCategoryId]);

  const [bottomSheetType, setBottomSheetType] = useState<
    "sort" | "brands" | null
  >(null);

  const [selectedSort, setSelectedSort] = useState<ProductSortType>("default");
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

  const handleSortApply = (sortType: ProductSortType) => {
    setSelectedSort(sortType);
    setBottomSheetType(null);
  };

  const handleBrandsApply = (brands: number[]) => {
    setSelectedBrands(brands);
    setBottomSheetType(null);
  };

  const subCategoryProductsQuery = useGetInfiniteProductsBySubCategory(
    currentSubCategoryId,
    selectedSort,
    CONSTANTS.limits.productsPerPage,
    !!currentSubCategoryId && !!hasSubCategories
  );

  const specialProductsQuery = useGetInfiniteProductsBySpecialCategory(
    currentCategoryId,
    selectedSort,
    CONSTANTS.limits.productsPerPage,
    !!currentCategoryId && !hasSubCategories
  );

  // Fetch products based on category type
  const productsQuery = hasSubCategories
    ? subCategoryProductsQuery
    : specialProductsQuery;

  // Memoize products
  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data]
  );

  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate categories for navbar (useGetCategoriesForNavbar)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.list({
          isActive: true,
          showOnNavbar: true,
        }),
      });
      // Invalidate subcategories for current category if available (useGetSubCategoriesByCategoryIdForNavbar)
      if (hasSubCategories) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.subCategories.byParentCategory(
            currentCategoryId,
            {
              isActive: true,
              showOnNavbar: true,
            }
          ),
        });
      }

      // Products - only refetch the CURRENT query (not all cached pages)
      await productsQuery.refetch(); // ✅ Just refetches current infinite query
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate product card width based on screen (moved before renderProduct for useCallback dependency)
  const productCardWidth = getResponsiveValue<number>(
    (width) => (width - 48) / 2,
    (width) => (width - 64) / 3
  );

  // Render product item - memoized for performance
  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      const cartItem = cart?.items.find((i) => i.productId === item.id);
      return (
        <View
          style={[
            styles.productItem,
            index % 2 === 0 ? styles.productItemLeft : styles.productItemRight,
          ]}>
          <ProductCard
            product={item}
            cardWidth={productCardWidth}
            quantityInCart={cartItem?.quantity || 0}
          />
        </View>
      );
    },
    [productCardWidth, cart]
  );

  // Number of columns for the grid
  const numColumns = getResponsiveValue<number>(2, 3);

  const listHeader = (
    <>
      <View style={styles.stickyHeader}>
        <CategoriesHeader
          currentCategoryName={
            currentCategory?.name || ""
          }
        />
        <CategoriesNav
          categories={categories}
          currentCategoryId={currentCategoryId}
          setCurrentCategoryId={setCurrentCategoryId}
        />
        <SubCategoriesNav
          subCategories={subCategoriesForNavbarData}
          loadingSubCategories={loadingSubCategoriesForNavbar}
          errorGettingSubCategories={errorGettingSubCategoriesForNavbar}
          parentCategoryId={currentCategoryId}
          currentSubCategoryId={currentSubCategoryId}
          setCurrentSubCategoryId={setCurrentSubCategoryId}
          setBottomSheetType={setBottomSheetType}
          selectedSort={selectedSort}
          selectedBrands={selectedBrands}
        />
      </View>

      {/* Products Loading/Error States */}
      {productsQuery.isLoading && (
        <View style={styles.productsLoading}>
          <Loading text="Loading products..." />
        </View>
      )}
      {productsQuery.error && !productsQuery.isLoading && (
        <View style={styles.productsLoading}>
          <Text style={styles.errorText}>Error loading products</Text>
          <RetryButton
            onPress={() => productsQuery.refetch()}
            text="Retry"
            style={styles.retryButton}
          />
        </View>
      )}
      {!productsQuery.isLoading &&
        !productsQuery.error &&
        products.length === 0 && (
          <View style={styles.productsLoading}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        )}
    </>
  );

  // Footer component for loading more indicator
  const listFooter = productsQuery.isFetchingNextPage ? (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  ) : null;

  // Loading state
  if (loadingCategoriesForNavbar) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Loading />
      </View>
    );
  }

  // Error state
  if (errorGettingCategoriesForNavbar) {
    return (
      <ErrorBanner
        title="Unable to Load"
        message="Error loading categories. Please try again."
        onRetry={async () => {
          // Invalidate the query to refetch categories for navbar (useGetCategoriesForNavbar)
          await queryClient.invalidateQueries({
            queryKey: queryKeys.categories.list({
              isActive: true,
              showOnNavbar: true,
            }),
          });
        }}
      />
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
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        columnWrapperStyle={styles.columnWrapper}
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={true}
        stickyHeaderIndices={[0]}
        onEndReached={() => {
          if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
            productsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[
              theme.colors.primary,
              theme.colors.secondary,
              theme.colors.error,
            ]}
            tintColor={theme.colors.primary}
          />
        }
      />
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
    paddingBottom: 100,
  },
  columnWrapper: {
    paddingTop: 16,
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  productItem: {
    flex: 1,
    // marginBottom: 16,
  },
  productItemLeft: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  productItemRight: {
    paddingLeft: 8,
    paddingRight: 16,
  },
  footer: {
    paddingVertical: 40,
    alignItems: "center",
  },
});
