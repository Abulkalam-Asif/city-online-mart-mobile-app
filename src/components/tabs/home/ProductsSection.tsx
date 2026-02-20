import { StyleSheet, View, ScrollView, Text, Pressable } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ProductCard from "./ProductCard";
import { Category } from "@/src/types";
import { useGetProductsBySpecialCategory } from "@/src/hooks/useProducts";
import Loading from "../../common/Loading";
import RetryButton from "../../common/RetryButton";
import { queryClient, queryKeys } from "@/src/lib/react-query";
import { useCart } from "@/src/hooks/useCart";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { CONSTANTS } from "@/src/constants/constants";

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
  } = useGetProductsBySpecialCategory(category.id, { limit: CONSTANTS.limits.homepageProductsPerSpecialCategory });

  const { cart } = useCart();

  const handleViewAll = () => {
    router.push({
      pathname: "/(tabs)/categories",
      params: { categoryId: category.id },
    });
  };

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
          (<>
            {products?.map((product) => {
              const cartItem = cart?.items.find((i: { productId: string }) => i.productId === product.id);
              return (
                <ProductCard key={product.id} product={product}
                  quantityInCart={cartItem?.quantity || 0}
                />
              )
            })}
            <View style={styles.viewAllButtonContainer}>
              <Pressable
                onPress={handleViewAll}
                style={({ pressed }) => [
                  styles.viewAllButton,
                  pressed && styles.viewAllButtonPressed,
                ]}>
                <FontAwesome6 name="arrow-right" size={20} color={theme.colors.primary} />
              </Pressable>
              <Text style={styles.viewAllText}>View All</Text>
            </View>
          </>)
        )}
      </ScrollView>
    </View>
  );
};

export default React.memo(ProductsSection);

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
  viewAllButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  viewAllButton: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: theme.colors.background_3,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewAllButtonPressed: {
    backgroundColor: theme.colors.background,
    transform: [{ scale: 0.95 }],
  },
  viewAllText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.text_secondary,
  },
});
