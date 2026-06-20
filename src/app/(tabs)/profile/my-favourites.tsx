import { FlatList, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useCallback } from "react";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { theme } from "@/src/constants/theme";
import ProductCard from "@/src/components/tabs/home/ProductCard";
import { useFavouriteProducts } from "@/src/hooks/useFavourites";
import { getResponsiveValue } from "@/src/utils/getResponsiveValue";
import { Product } from "@/src/types";

const MyFavouritesScreen = () => {
  const { data: favourites, isLoading } = useFavouriteProducts();

  const numColumns = getResponsiveValue<number>(2, 3);
  const productCardWidth = getResponsiveValue<number>(
    (width) => (width - 48) / 2,
    (width) => (width - 64) / 3
  );

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      return (
        <View
          style={[
            styles.productItem,
            index % 2 === 0 ? styles.productItemLeft : styles.productItemRight,
          ]}>
          <ProductCard product={item} cardWidth={productCardWidth} />
        </View>
      );
    },
    [productCardWidth]
  );

  return (
    <View style={styles.container}>
      <GeneralTopBar text="My Favourites" />
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : favourites && favourites.length > 0 ? (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.itemsCountText}>{favourites.length} items</Text>
          </View>
          <FlatList
            style={styles.container}
            contentContainerStyle={styles.containerContent}
            data={favourites}
            numColumns={numColumns}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>You have no favourite products.</Text>
        </View>
      )}
    </View>
  );
};

export default MyFavouritesScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  containerContent: {
    paddingBottom: 100,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  itemsCountText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    fontSize: 16,
  },
  productItem: {
    flex: 1,
  },
  productItemLeft: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  productItemRight: {
    paddingLeft: 8,
    paddingRight: 16,
  },
});
