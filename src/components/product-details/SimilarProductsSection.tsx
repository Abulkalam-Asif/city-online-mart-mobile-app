import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback } from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "../tabs/home/ProductCard";
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

  if (subCategoryProductsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Similar products</Text>
        <Loading size={"small"} />
      </View>
    );
  }

  if (!subCategoryProductsQuery.isLoading && products.length === 0) return null;

  const renderFooter = useCallback(() => {
    if (!subCategoryProductsQuery.isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <Loading size={"small"} />
      </View>
    );
  }, [subCategoryProductsQuery.isFetchingNextPage]);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Similar products</Text>
      <FlatList
        horizontal
        data={products}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <ProductCard product={item} />}
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
  footerLoader: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
});
