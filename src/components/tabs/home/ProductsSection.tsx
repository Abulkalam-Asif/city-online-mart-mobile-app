import { StyleSheet, View, ScrollView, Text } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "./ProductCard";
import { Category } from "@/src/types";
import { useGetProductsBySpecialCategory } from "@/src/hooks/useProducts";
import Loading from "../../common/Loading";
import RetryButton from "../../common/RetryButton";
import { queryClient, queryKeys } from "@/src/lib/react-query";
import { useCart } from "@/src/hooks/useCart";

type ProductsSectionProps = {
  category: Category;
  sectionBackgroundColor?: string;
};

const ProductsSection = ({
  category,
  sectionBackgroundColor,
}: ProductsSectionProps) => {
  const {
    data: products,
    isLoading: loadingProducts,
    error: errorGettingProducts,
  } = useGetProductsBySpecialCategory(category.id);

  const { data: cart } = useCart();

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{category.name}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: sectionBackgroundColor },
        ]}>
        {loadingProducts ? (
          <Loading />
        ) : errorGettingProducts ? (
          <RetryButton
            onPress={async () => {
              await queryClient.invalidateQueries({
                queryKey: queryKeys.products.bySpecialCategory(category.id),
              });
            }}
          />
        ) : (
          products &&
          products.length > 0 &&
          products?.map((product) => {
            const cartItem = cart?.items.find(i => i.productId === product.id);
            return (
              <ProductCard key={product.id} product={product}
                quantityInCart={cartItem?.quantity || 0}
              />
            )
          })
        )}
      </ScrollView>
    </View>
  );
};

export default ProductsSection;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  titleText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexDirection: "row",
    minWidth: "100%",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
