import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { IProduct } from "@/src/types";

type Props = {
  product: IProduct;
  hasBackground?: boolean;
};

const ProductCard = ({ product, hasBackground = false }: Props) => {
  const [quantityInCart, setQuantityInCart] = useState(0);

  const handleProductPress = () => {
    router.push({
      pathname: "/product-details",
      params: { id: String(product.Id) },
    });
  };

  return (
    <Pressable
      style={[styles.card, hasBackground && styles.cardBackground]}
      onPress={handleProductPress}>
      {product.OldPrice && product.OldPrice > product.Price && (
        <Text style={styles.discountText}>
          Rs. {product.OldPrice - product.Price} off
        </Text>
      )}
      <View style={styles.imageContainer}>
        <Image
          source={product.MainImageUrl || product.ThumbnailUrl}
          style={styles.image}
        />
      </View>
      <Text style={styles.nameText} numberOfLines={2} ellipsizeMode="tail">
        {product.Name}
      </Text>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>Rs. {product.Price}</Text>
        {product.OldPrice && (
          <Text style={styles.oldPriceText}>Rs. {product.OldPrice}</Text>
        )}
      </View>
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

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    width: 180,
    position: "relative",
  },
  cardBackground: {
    backgroundColor: theme.colors.background_3,
  },
  discountText: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    color: theme.colors.primary,
    fontSize: 10,
    fontFamily: theme.fonts.medium,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 14,
    paddingVertical: 30,
  },
  image: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  nameText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  priceText: {
    fontSize: 12,
    fontFamily: theme.fonts.semi_bold,
    color: theme.colors.secondary,
  },
  oldPriceText: {
    fontSize: 8,
    textDecorationLine: "line-through",
    color: "red",
  },
  addToCartSection: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
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
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
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
