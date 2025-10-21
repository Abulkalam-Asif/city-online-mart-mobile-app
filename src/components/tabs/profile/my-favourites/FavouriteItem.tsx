import { StyleSheet, Text, View, Pressable } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { router } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

type FavouriteItemProps = {
  item: {
    Id: number;
    MainImageUrl: any;
    Name: string;
    Price: number;
    OldPrice?: number;
    quantity: number;
    discount?: string;
  };
};

const FavouriteItem = ({ item }: FavouriteItemProps) => {
  const [quantityInCart, setQuantityInCart] = useState(0);

  const calculateDiscount = () => {
    if (item.OldPrice && item.OldPrice > item.Price) {
      return item.OldPrice - item.Price;
    }
    return 0;
  };

  const discount = calculateDiscount();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemCard,
        pressed && styles.itemCardPressed,
      ]}
      onPress={() => router.push(`/product-details?id=${item.Id}`)}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={item.MainImageUrl}
          style={styles.productImage}
          contentFit="contain"
        />
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productNameText} numberOfLines={2}>
          {item.Name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.currentPriceText}>Rs. {item.Price}</Text>
          {item.OldPrice && item.OldPrice > item.Price && (
            <Text style={styles.oldPriceText}>Rs. {item.OldPrice}</Text>
          )}
          {discount > 0 && (
            <Text style={styles.discountTag}>{`Rs. ${discount} off`}</Text>
          )}
        </View>
      </View>

      {/* Add to Cart Section */}
      <View style={styles.addToCartSection}>
        {quantityInCart > 0 && (
          <View style={styles.quantitySection}>
            <Pressable
              style={({ pressed }) => [
                styles.quantityChangeButton,
                pressed && styles.quantityChangeButtonPressed,
              ]}
              onPress={() => setQuantityInCart(quantityInCart - 1)}>
              <FontAwesome6 name="minus" />
            </Pressable>
            <Text style={styles.quantityText}>{quantityInCart}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.quantityChangeButton,
                pressed && styles.quantityChangeButtonPressed,
              ]}
              onPress={() => setQuantityInCart(quantityInCart + 1)}>
              <FontAwesome6 name="plus" />
            </Pressable>
          </View>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.addToCartButton,
            pressed && styles.addToCartButtonPressed,
          ]}
          onPress={() => setQuantityInCart(1)}>
          <Text style={styles.addToCartText}>
            {quantityInCart === 0 ? "Add to Cart" : `View cart`}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default FavouriteItem;

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 1,
    alignItems: "center",
  },
  itemCardPressed: {
    backgroundColor: theme.colors.background_3,
    opacity: 0.8,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productImage: {
    width: 40,
    height: 40,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 12,
  },
  productNameText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 10,
  },
  currentPriceText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  oldPriceText: {
    fontSize: 12,
    color: "red",
    textDecorationLine: "line-through",
    fontFamily: theme.fonts.regular,
  },
  discountTag: {
    backgroundColor: theme.colors.tag,
    fontSize: 8,
    lineHeight: 16,
    fontFamily: theme.fonts.semibold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    color: "black",
  },

  addToCartSection: {
    flexDirection: "column",
    gap: 3,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 20,
  },
  quantityChangeButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    padding: 7,
    borderRadius: 20,
  },
  quantityChangeButtonPressed: {
    backgroundColor: theme.colors.background,
  },
  quantityText: {
    fontFamily: theme.fonts.medium,
    flex: 1,
    textAlign: "center",
    fontSize: 12,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addToCartButtonPressed: {
    opacity: 0.8,
  },
  addToCartText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: theme.fonts.medium,
    fontSize: 10,
  },
});
