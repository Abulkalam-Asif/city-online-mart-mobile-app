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
import { PortalBottomSheet } from "@/src/components/common/PortalBottomSheet";
import BrandsMenu from "@/src/components/tabs/categories/BrandsMenu";
import SortMenu from "@/src/components/tabs/categories/SortMenu";
import {
  useGetCategoriesForNavbar,
  useGetSubCategoriesByCategoryIdForNavbar,
} from "@/src/hooks/useCategories";
// import {
//   useInfiniteProductsByCategory,
//   useInfiniteProductsBySubCategory,
// } from "@/src/hooks/useProducts";
import { theme } from "@/src/constants/theme";
import Loading from "@/src/components/common/Loading";
import { useLocalSearchParams } from "expo-router";
import { queryClient, queryKeys } from "@/src/lib/react-query";
import ErrorBanner from "@/src/components/common/ErrorBanner";

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

  // Track if we should auto-scroll (from deep link)
  const shouldAutoScroll = useRef(false);

  useEffect(() => {
    if (searchParamCategoryId) {
      shouldAutoScroll.current = true; // Enable auto-scroll for deep link navigation
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

  // // Fetch products based on whether subcategory is selected
  // const {
  //   data: subCategoryProductsData,
  //   isLoading: isLoadingSubCategoryProducts,
  //   error: subCategoryProductsError,
  //   fetchNextPage: fetchNextSubCategoryPage,
  //   hasNextPage: hasNextSubCategoryPage,
  //   isFetchingNextPage: isFetchingNextSubCategoryPage,
  // } = useInfiniteProductsBySubCategory(currentCategoryId, currentSubCategoryId);

  // const {
  //   data: categoryProductsData,
  //   isLoading: isLoadingCategoryProducts,
  //   error: categoryProductsError,
  //   fetchNextPage: fetchNextCategoryPage,
  //   hasNextPage: hasNextCategoryPage,
  //   isFetchingNextPage: isFetchingNextCategoryPage,
  // } = useInfiniteProductsByCategory(currentCategoryId);

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
    } finally {
      setIsRefreshing(false);
    }
  };

  // Flatten the infinite query pages into a single array
  // const products = useMemo(() => {
  //   if (hasSubCategories && currentSubCategoryId) {
  //     return (
  //       subCategoryProductsData?.pages.flatMap((page: any) => page.products) ||
  //       []
  //     );
  //   } else {
  //     return (
  //       categoryProductsData?.pages.flatMap((page: any) => page.products) || []
  //     );
  //   }
  // }, [
  //   hasSubCategories,
  //   currentSubCategoryId,
  //   subCategoryProductsData,
  //   categoryProductsData,
  // ]);

  // Determine loading and error states
  // const isLoadingProducts = hasSubCategories
  //   ? isLoadingSubCategoryProducts
  //   : isLoadingCategoryProducts;
  // const productsError = hasSubCategories
  //   ? subCategoryProductsError
  //   : categoryProductsError;

  // // Handle load more
  // const handleLoadMore = () => {
  //   if (hasSubCategories && currentSubCategoryId) {
  //     if (hasNextSubCategoryPage && !isFetchingNextSubCategoryPage) {
  //       fetchNextSubCategoryPage();
  //     }
  //   } else {
  //     if (hasNextCategoryPage && !isFetchingNextCategoryPage) {
  //       fetchNextCategoryPage();
  //     }
  //   }
  // };

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
            subCategories={subCategoriesForNavbarData}
            loadingSubCategories={loadingSubCategoriesForNavbar}
            errorGettingSubCategories={errorGettingSubCategoriesForNavbar}
            parentCategoryId={currentCategoryId}
            currentSubCategoryId={currentSubCategoryId}
            setCurrentSubCategoryId={setCurrentSubCategoryId}
            setBottomSheetType={setBottomSheetType}
            selectedSort={selectedSort}
            selectedBrands={selectedBrands}
            shouldAutoScroll={shouldAutoScroll}
          />
        </View>

        {/* Products Loading State */}
        {/* {isLoadingProducts ? (
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
        )} */}
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
