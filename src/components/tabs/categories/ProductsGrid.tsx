import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Product } from "@/src/types";
import ProductCard from "@/src/components/tabs/home/ProductCard";

type ProductsGridProps = {
  products: Product[];
  selectedSort?: string;
  selectedBrands?: number[];
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};

const { width } = Dimensions.get("window");

const ProductsGrid = ({
  products,
  selectedSort,
  selectedBrands,
  onEndReached,
  hasNextPage,
  isFetchingNextPage,
}: ProductsGridProps) => {
  // Filter products based on selected brands (for future API integration)
  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

    // TODO: Filter by selectedBrands when brand data is available in products
    // if (selectedBrands && selectedBrands.length > 0) {
    //   filtered = filtered.filter(product =>
    //     selectedBrands.includes(product.BrandId || 0)
    //   );
    // }

    return filtered;
  }, [products]);

  // Sort products based on selected sort option
  const sortedProducts = React.useMemo(() => {
    const sorted = [...filteredProducts];

    switch (selectedSort) {
      case "price-low-high":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return sorted.sort((a, b) => b.price - a.price);
      case "name-a-z":
        return sorted.sort((a, b) => a.info.name.localeCompare(b.info.name));
      case "name-z-a":
        return sorted.sort((a, b) => b.info.name.localeCompare(a.info.name));
      case "newest":
        // TODO: Sort by CreatedOnUtc when available
        return sorted;
      case "recommended":
      default:
        return sorted;
    }
  }, [filteredProducts, selectedSort]);

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      cardWidth={width > 500 ? (width - 64) / 3 : (width - 48) / 2}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={width > 500 ? 3 : 2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Since it's inside ScrollView in parent
        onEndReached={hasNextPage ? onEndReached : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default ProductsGrid;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
