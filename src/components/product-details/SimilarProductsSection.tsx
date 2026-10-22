import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import React, { useCallback } from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "../tabs/home/ProductCard";
import { ProductsRowSkeleton } from "../tabs/home/HomeSkeletons";
import { Product } from "@/src/types";
import { useGetInfiniteProductsBySubCategory } from "@/src/hooks/useProducts";
import { CONSTANTS } from "@/src/constants/constants";
import Loading from "../common/Loading";

type SimilarProductsSectionProps = {
  productId: string;
  subCategoryId: string
};

const SimilarProductsSection = ({
  productId,
  subCategoryId
}: SimilarProductsSectionProps) => {
  const subCategoryProductsQuery = useGetInfiniteProductsBySubCategory(subCategoryId, "default", CONSTANTS.limits.similarProductsPageSize, !!subCategoryId);

  const products = subCategoryProductsQuery.data?.pages.flatMap((page) => page.items).filter((product) => product.id !== productId) || [];

  const { width: screenWidth } = useWindowDimensions();
  const productCardWidth = Math.max(150, Math.min(220, screenWidth * 0.4));

  // Hooks must run on every render, so they sit above the early returns below.
  const renderFooter = useCallback(() => {
    if (!subCategoryProductsQuery.isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <Loading size={"small"} />
      </View>
    );
  }, [subCategoryProductsQuery.isFetchingNextPage]);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  if (subCategoryProductsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Similar products</Text>
        <View style={styles.skeletonRow}>
          <ProductsRowSkeleton cardWidth={productCardWidth} />
        </View>
      </View>
    );
  }

  if (!subCategoryProductsQuery.isLoading && products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Similar products</Text>
      <FlatList
        horizontal
        data={products}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <ProductCard product={item} cardWidth={productCardWidth} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onEndReached={() => {
          if (subCategoryProductsQuery.hasNextPage && !subCategoryProductsQuery.isFetchingNextPage) {
            subCategoryProductsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default SimilarProductsSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  titleText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 20,
  },
  skeletonRow: {
    paddingHorizontal: 20,
  },
  footerLoader: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
});
