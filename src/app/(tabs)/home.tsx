import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import React, { useState } from "react";
import HomeSearchSection from "@/src/components/tabs/home/HomeSearchSection";
import CategoriesSection from "@/src/components/tabs/home/categories-section/CategoriesSection";
import HomeTopBg from "@/src/components/tabs/home/HomeTopBg";
import Sidebar from "@/src/components/tabs/home/Sidebar";
import ProductsSection from "@/src/components/tabs/home/ProductsSection";
import {
  useGetCategoriesForHomepage,
  useGetSpecialCategories,
} from "@/src/hooks/useCategories";
import EmptyState from "@/src/components/common/EmptyState";
import { queryClient, queryKeys } from "@/src/lib/react-query";
import { theme } from "@/src/constants/theme";
import { ProductsSectionSkeleton } from "@/src/components/tabs/home/HomeSkeletons";
import { Category } from "@/src/types";
import BannersCarousel from "@/src/components/tabs/home/BannersCarousel";
import PopupBanner from "@/src/components/tabs/home/PopupBanner";
import { CONSTANTS } from "@/src/constants/constants";

const HomeScreen = () => {
  const {
    data: specialCategories,
    isLoading: loadingSpecialCategories,
    error: errorGettingSpecialCategories,
    refetch: refetchSpecialCategories,
  } = useGetSpecialCategories({
    productsCountGreaterThanZero: true,
  });

  // Same query as the Categories section (shared cache): used to tell "nothing in this store yet"
  const { data: homepageCategories, isLoading: loadingHomepageCategories } =
    useGetCategoriesForHomepage();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    // Step 1: Invalidate and refetch categories FIRST
    await Promise.all([
      // Invalidate and refetch categories for homepage (useGetCategoriesForHomepage)
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.list({
          isActive: true,
          showOnHomepage: true,
        }),
      }),
      // Invalidate and refetch special categories (useGetSpecialCategories)
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.list({
          isActive: true,
          special: true,
          productsCountGreaterThanZero: true,
        }),
      }),
    ]);

    // Step 2: Now specialCategories will have updated data
    // Get fresh data from the cache
    const freshCategories = queryClient.getQueryData<Category[]>(
      queryKeys.categories.list({
        isActive: true,
        special: true,
        productsCountGreaterThanZero: true,
      })
    );

    // Step 3: Invalidate products for all (fresh) special categories (useGetProductsBySpecialCategory)
    if (freshCategories && freshCategories.length > 0) {
      await Promise.all(
        freshCategories.map((category) =>
          queryClient.invalidateQueries({
            queryKey: queryKeys.products.bySpecialCategory(category.id, {
              limit: CONSTANTS.limits.homepageProductsPerSpecialCategory,
            }),
          })
        )
      );
    }

    // Step 4: Invalidate homepage banners
    await queryClient.invalidateQueries({
      queryKey: queryKeys.banners.homepage,
    });

    setRefreshing(false);
  };

  return (
    <>
      {/* Popup Banner Modal - Shows on app start */}
      <PopupBanner />
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebarHandler={() => setIsSidebarOpen(false)}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[
              theme.colors.primary,
              theme.colors.secondary,
              theme.colors.error,
            ]} // Android
            tintColor={theme.colors.primary} // iOS
          />
        }>
        <HomeTopBg />
        <HomeSearchSection openSidebarHandler={() => setIsSidebarOpen(true)} />
        <BannersCarousel />
        {/* <BestPricesSection /> */}
        <CategoriesSection />
        {loadingSpecialCategories ? (
          <>
            <ProductsSectionSkeleton colorIndex={0} />
            <ProductsSectionSkeleton colorIndex={1} />
          </>
        ) : errorGettingSpecialCategories ? (
          <EmptyState
            tone="error"
            title="Couldn't load products"
            message="Please check your internet connection and try again."
            actionText="Retry"
            onAction={() => refetchSpecialCategories()}
          />
        ) : specialCategories && specialCategories.length > 0 ? (
          specialCategories.map((category, index) => (
            <ProductsSection
              key={category.id}
              category={category}
              sectionBackgroundColor={
                theme.extra_light_colors[
                index % theme.extra_light_colors.length
                ]
              }
            />
          ))
        ) : !loadingHomepageCategories && !homepageCategories?.length ? (
          <EmptyState
            icon="storefront-outline"
            title="Products are coming soon"
            message="We are adding products to your city's store. Please check back shortly."
          />
        ) : null}
      </ScrollView>


    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  containerContent: {
    paddingBottom: 100,
  },
});
