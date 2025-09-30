import { ScrollView, StyleSheet } from "react-native";
import React, { useState } from "react";
import CategoriesHeader from "@/src/components/tabs/categories/CategoriesHeader";
import { tempProducts } from "@/temp/home/products/tempProducts";
import CategoriesNav from "@/src/components/tabs/categories/CategoriesNav";

const CategoriesScreen = () => {
  const categories = tempProducts;
  const [currentCategory, setCurrentCategory] = useState(categories[0]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      stickyHeaderIndices={[0, 1]}>
      <CategoriesHeader currentCategoryName={currentCategory.Category.Name} />
      <CategoriesNav
        categories={categories}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
      />
    </ScrollView>
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
});
