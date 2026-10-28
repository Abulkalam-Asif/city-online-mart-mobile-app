import React from "react";
import ProductDetailsContent from "@/src/components/product-details/ProductDetailsContent";
import ProductDetailsSkeleton from "@/src/components/product-details/ProductDetailsSkeleton";
import { router, useLocalSearchParams } from "expo-router";
import { useProductById } from "@/src/hooks/useProducts";
import { StyleSheet, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import EmptyState from "@/src/components/common/EmptyState";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading, isError, refetch } = useProductById(id);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  // The request itself failed (offline, server error): not the same as "no such product"
  if (isError) {
    return (
      <View style={styles.container}>
        <GeneralTopBar text="Product" />
        <EmptyState
          tone="error"
          title="Couldn't load this product"
          message="Check your connection and try again."
          actionText="Retry"
          onAction={() => refetch()}
          style={styles.emptyState}
        />
      </View>
    );
  }

  if (!id || !product) {
    return (
      <View style={styles.container}>
        <GeneralTopBar text="Product" />
        <EmptyState
          icon="basket-outline"
          title="Product not found"
          message="This product may have been removed."
          actionText="Go back"
          onAction={() => router.back()}
          style={styles.emptyState}
        />
      </View>
    );
  }

  return <ProductDetailsContent product={product} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
  },
});
