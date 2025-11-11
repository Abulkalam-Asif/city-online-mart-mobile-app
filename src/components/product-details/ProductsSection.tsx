import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "../tabs/home/ProductCard";
import { Product } from "@/src/types";

type ProductsSectionProps = {
  sectionTitle: string;
  products: Product[];
  onEndReached: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

const ProductsSection = ({
  sectionTitle,
  products,
  onEndReached,
  hasNextPage,
  isFetchingNextPage,
}: ProductsSectionProps) => {
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{sectionTitle}</Text>
      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            onEndReached();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
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
    fontFamily: theme.fonts.semibold,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 20,
  },
  footerLoader: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
