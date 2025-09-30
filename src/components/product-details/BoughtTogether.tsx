import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "../tabs/home/ProductCard";

type Props = Record<string, never>;

const BoughtTogether = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.boughtTogetherText}>Frequently bought together</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.scrollContent}>
        {productsData.Products.map((product) => (
          <ProductCard key={product.Id} product={product} insideModal={true} />
        ))}
      </ScrollView>
    </View>
  );
};

export default BoughtTogether;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
  },
  boughtTogetherText: {
    fontSize: 16,
    fontFamily: theme.fonts.semi_bold,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 16,
  },
});
