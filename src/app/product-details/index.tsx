import React from "react";
import ProductDetailsContent from "@/src/components/product-details/ProductDetailsContent";
import { useLocalSearchParams } from "expo-router";
import { useProductById } from "@/src/hooks/useProducts";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/src/constants/theme";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useProductById(id);

  if (!id || !product) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Product ID is missing</Text>
      </View>
    );
  }

  return <ProductDetailsContent product={product} isLoading={isLoading} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
});
