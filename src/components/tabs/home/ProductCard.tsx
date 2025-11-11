import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { Product } from "@/src/types";
import { useSinglePress } from "@/src/hooks/useSinglePress";
import { productService } from "@/src/services/productService";

type Props = {
  product: Product;
  cardWidth?: number | `${number}%`;
};

const ProductCard = ({ product, cardWidth = 150 }: Props) => {
  const [quantityInCart, setQuantityInCart] = useState(0);
  const canPress = useSinglePress();

  const handleProductPress = () => {
    if (!canPress()) return;

    router.push({
      pathname: "/product-details",
      params: { id: product.id },
    });
  };

  // Calculate discount information
  const hasDiscount =
    product.discountPercentage && product.discountPercentage > 0;
  const originalPrice = product.price;
  const discountedPrice = hasDiscount
    ? Math.round(
        originalPrice - (originalPrice * product.discountPercentage!) / 100
      )
    : originalPrice;
  const savingsAmount = hasDiscount ? originalPrice - discountedPrice : 0;

  // Get primary image (first image in array)
  const primaryImage = product.multimedia?.images?.[0] || "";

  return (
    <Pressable
      style={[
        styles.card,
        {
          width: cardWidth,
        },
      ]}
      onPress={handleProductPress}>
      {productService.isMarkAsNewValid(
        product.info.markAsNewStartDate,
        product.info.markAsNewEndDate
      ) ? (
        <Text style={styles.newText}>New</Text>
      ) : null}
      {hasDiscount ? (
        <Text style={styles.discountText}>Rs. {savingsAmount} off</Text>
      ) : null}
      <View style={styles.imageContainer}>
        <Image source={primaryImage} style={styles.image} />
      </View>
      <Text style={styles.nameText} numberOfLines={2} ellipsizeMode="tail">
        {product.info.name}
      </Text>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>Rs. {discountedPrice}</Text>
        {hasDiscount ? (
          <Text style={styles.oldPriceText}>Rs. {originalPrice}</Text>
        ) : null}
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
    borderRadius: 16,
    padding: 10,
    position: "relative",
    backgroundColor: theme.colors.background_3,
  },
  newText: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.colors.tag,
    color: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
    fontSize: 10,
    fontFamily: theme.fonts.medium,
  },
  discountText: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
    color: theme.colors.primary,
    fontSize: 10,
    fontFamily: theme.fonts.medium,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 14,
    paddingTop: 24,
    paddingBottom: 16,
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
    fontFamily: theme.fonts.semibold,
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
