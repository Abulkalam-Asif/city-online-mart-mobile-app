import { StyleSheet, View, ScrollView, Text } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "./ProductCard";
import { ICategory, IProduct } from "@/src/types";

type ProductsSectionProps = {
  category: ICategory;
  sectionBackgroundColor?: string;
  products?: IProduct[];
};

const ProductsSection = ({
  category,
  sectionBackgroundColor,
  products,
}: ProductsSectionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{category.Name}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: sectionBackgroundColor },
        ]}>
        {products &&
          products.length > 0 &&
          products?.map((product) => (
            <ProductCard key={product.Id} product={product} />
          ))}
      </ScrollView>
    </View>
  );
};

export default ProductsSection;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  titleText: {
    fontFamily: theme.fonts.semi_bold,
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
