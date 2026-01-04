import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import React, { useState } from "react";
import BannersCarousel from "@/src/components/tabs/home/BannersCarousel";
import HomeSearchSection from "@/src/components/tabs/home/HomeSearchSection";
import CategoriesSection from "@/src/components/tabs/home/categories-section/CategoriesSection";
import BestPricesSection from "@/src/components/tabs/home/categories-section/BestPricesSection";
// import ProductsSection from "@/src/components/tabs/home/ProductsSection";
// import { theme } from "@/src/constants/theme";
// import { useCategories, useCategoryProducts } from "@/src/hooks/useCategories";
import HomeTopBg from "@/src/components/tabs/home/HomeTopBg";
import Sidebar from "@/src/components/tabs/home/Sidebar";
import PopupBanner from "@/src/components/tabs/home/PopupBanner";
import ProductsSection from "@/src/components/tabs/home/ProductsSection";
import { useGetSpecialCategoriesForHomepage } from "@/src/hooks/useCategories";
import { queryClient, queryKeys } from "@/src/lib/react-query";
import { theme } from "@/src/constants/theme";

const HomeScreen = () => {
  // const { data: categories, isLoading: loadingCategories } = useCategories();
  // const { data: categoryProductsData, isLoading: loadingCategoryProducts } =
  //   useCategoryProducts(1);
  // console.log(categoryProductsData);

  // if (!categoryProductsData || loadingCategories || loadingCategoryProducts) {
  //   return <></>;
  // }

  // Fetch special categories for homepage (e.g., "Summer Sales", "Black Friday", etc.)
  // const { data: specialCategories, isLoading: loadingSpecialCategories } =
  //   useGetSpecialCategoriesForHomepage();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    // Invalidate all queries that power the homepage
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.list({
          isActive: true,
          showOnHomepage: true,
        })
      }),
    ]);

    setRefreshing(false);
  };

  return (
    <>
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
        }
      >
        <HomeTopBg />
        <HomeSearchSection openSidebarHandler={() => setIsSidebarOpen(true)} />
        <BannersCarousel />
        <BestPricesSection />
        <CategoriesSection />
        {/* 
        <ProductsSection
          // sectionTitle={categoryProductsData.Category.Name}
          // sectionTagline={categoryProductsData.Category.Description}
          // categoryIdForSeeAll={categoryProductsData.Category.Id}
          // products={categoryProductsData.Products}
          // sectionBackgroundColor={theme.colors.secondary_bg_2}
          category={tempProducts[0].Category}
          products={tempProducts[0].Products}
          sectionBackgroundColor={theme.extra_light_colors[0]}
        />
        <ProductsSection
          // sectionTitle={categoryProductsData.Category.Name}
          // sectionTagline={categoryProductsData.Category.Description}
          // categoryIdForSeeAll={categoryProductsData.Category.Id}
          // products={categoryProductsData.Products}
          // sectionBackgroundColor={theme.colors.secondary_bg_2}
          category={tempProducts[1].Category}
          products={tempProducts[1].Products}
          sectionBackgroundColor={theme.extra_light_colors[1]}
        /> */}
      </ScrollView>

      {/* Popup Banner Modal - Shows on app start */}
      <PopupBanner />
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebarHandler={() => setIsSidebarOpen(false)}
      />
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
