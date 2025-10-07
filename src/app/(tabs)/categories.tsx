import { ScrollView, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import CategoriesHeader from "@/src/components/tabs/categories/CategoriesHeader";
import { tempProducts } from "@/temp/home/products/tempProducts";
import CategoriesNav from "@/src/components/tabs/categories/CategoriesNav";
import SubCategoriesNav from "@/src/components/tabs/categories/SubCategoriesNav";
import ProductsGrid from "@/src/components/tabs/categories/ProductsGrid";
import { PortalBottomSheet } from "@/src/components/common/PortalBottomSheet";
import BrandsMenu from "@/src/components/tabs/categories/BrandsMenu";
import SortMenu from "@/src/components/tabs/categories/SortMenu";

const CategoriesScreen = () => {
  const categories = tempProducts;
  const [currentCategoryId, setCurrentCategoryId] = useState(
    categories[0].Category.Id
  );
  const [currentSubCategoryId, setCurrentSubCategoryId] = useState(
    categories[0].SubCategories[0].Id
  );

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

  // Get current category's products
  const currentCategoryProducts = React.useMemo(() => {
    const category = categories.find(
      (cat) => cat.Category.Id === currentCategoryId
    );
    return category?.Products || [];
  }, [categories, currentCategoryId]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        stickyHeaderIndices={[0]}>
        <View style={styles.stickyHeader}>
          <CategoriesHeader
            currentCategoryName={
              categories.find((cat) => cat.Category.Id === currentCategoryId)
                ?.Category.Name || ""
            }
          />
          <CategoriesNav
            categories={categories}
            currentCategoryId={currentCategoryId}
            setCurrentCategoryId={setCurrentCategoryId}
            setCurrentSubCategoryId={setCurrentSubCategoryId}
          />
          <SubCategoriesNav
            subCategories={
              categories.find((cat) => cat.Category.Id === currentCategoryId)
                ?.SubCategories || []
            }
            currentSubCategoryId={currentSubCategoryId}
            setCurrentSubCategoryId={setCurrentSubCategoryId}
            setBottomSheetType={setBottomSheetType}
            selectedSort={selectedSort}
            selectedBrands={selectedBrands}
          />
        </View>
        <ProductsGrid
          products={currentCategoryProducts}
          selectedSort={selectedSort}
          selectedBrands={selectedBrands}
        />
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
});
