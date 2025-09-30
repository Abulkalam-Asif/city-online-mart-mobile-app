import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "../tabs/home/ProductCard";
import { IProduct } from "@/src/types";

type SimilarProductsProps = {
  sectionTitle?: string;
  products: IProduct[];
};

const ProductsSection = ({ sectionTitle, products }: SimilarProductsProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{sectionTitle}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}>
        {products.map((product) => (
          <ProductCard
            key={product.Id}
            product={product}
            hasBackground={true}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default ProductsSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  titleText: {
    fontSize: 16,
    fontFamily: theme.fonts.semi_bold,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
