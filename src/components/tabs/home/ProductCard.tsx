import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { Product } from "@/src/types";
import { useSinglePress } from "@/src/hooks/useSinglePress";
import { useAddToCart, useUpdateCartItem, useCart } from "@/src/hooks/useCart";
import { productUtils } from "@/src/utils/productUtils";
import { useOrderSettings } from "@/src/hooks/useSettings";
import ErrorBanner from "@/src/components/common/ErrorBanner";

type ProductCardProps = {
  product: Product;
  cardWidth?: number | `${number}%`;
  quantityInCart?: number; // Deprecated: now derived from CartContext
};

const ProductCard = ({
  product,
  cardWidth = 150,
}: ProductCardProps) => {
  const canPress = useSinglePress();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  // Settings
  const { data: orderSettings } = useOrderSettings();
  const maxCartQuantity = orderSettings?.maxCartQuantityPerProduct || 50;

  // Read quantity directly from CartContext (always fresh, no stale prop issue)
  const { cart } = useCart();
  const quantityInCart = useMemo(
    () => cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0,
    [cart?.items, product.id]
  );

  // Cart mutations
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();

  const handleProductPress = useCallback(() => {
    if (!canPress()) return;

    router.push({
      pathname: "/product-details",
      params: { id: product.id },
    });
  }, [canPress, product.id]);

  const bestDiscount = useMemo(() =>
    product.validApplicableDiscounts.reduce(
      (best, current) => (current.percentage > (best?.percentage || 0) ? current : best),
      null as typeof product.validApplicableDiscounts[0] | null
    ), [product]
  );

  const { highestDiscount, discountedPrice, originalPrice, hasDiscount } = useMemo(() => {
    const highestDiscount = bestDiscount?.percentage || 0;
    const discountedPrice = highestDiscount > 0 ? Math.floor(product.price * (1 - highestDiscount / 100)) : product.price;
    const originalPrice = product.price;
    const hasDiscount = product.validApplicableDiscounts.length > 0;
    return { highestDiscount, discountedPrice, originalPrice, hasDiscount };
  }, [bestDiscount, product]);

  // Get primary image (first image in array)
  const primaryImage = product.multimedia?.images?.[0] || require("@/src/assets/default-image.png");

  // Calculate actual available stock
  const availableStock = useMemo(() => {
    const usableStock = product.batchStock?.usableStock || 0;
    const committedStock = product.batchStock?.committedStock || 0;
    return Math.max(0, usableStock - committedStock);
  }, [product]);

  // Event handlers
  const handleDecrement = useCallback(() => {
    if (quantityInCart > 1) {
      updateCartItemMutation.mutate({
        productId: product.id,
        quantity: quantityInCart - 1,
      });
    } else {
      // If quantity is 1, remove the item
      updateCartItemMutation.mutate({
        productId: product.id,
        quantity: 0,
      });
    }
  }, [quantityInCart, product.id, updateCartItemMutation]);

  const handleIncrement = useCallback(() => {
    const newQuantity = quantityInCart + 1;

    if (newQuantity > availableStock) {
      setError({
        title: "Max Available Reached",
        message: `You've added all available stock (${availableStock}) for this item.`
      });
      return;
    }

    if (newQuantity > maxCartQuantity) {
      setError({
        title: "Limit Reached",
        message: `You can only order a maximum of ${maxCartQuantity} per order.`
      });
      return;
    }

    updateCartItemMutation.mutate({
      productId: product.id,
      quantity: newQuantity,
    });
  }, [quantityInCart, product.id, updateCartItemMutation, availableStock, maxCartQuantity]);

  const handleAddToCart = useCallback(() => {
    if (availableStock < 1) {
      setError({
        title: "Out of Stock",
        message: "This item is currently out of stock."
      });
      return;
    }

    // Add to cart for first time
    addToCartMutation.mutate({
      productId: product.id,
      productName: product.info.name,
      unitPrice: product.price,
      discountPercentage: highestDiscount,
      appliedDiscountId: bestDiscount?.id,
      appliedDiscountSource: bestDiscount?.source,
      imageUrl: primaryImage,
      quantity: 1,
    });
  }, [product.id, product.info.name, product.price, addToCartMutation, bestDiscount, highestDiscount, primaryImage, availableStock]);

  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
        },
      ]}>
      <Pressable
        onPress={handleProductPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressablePressed,
        ]}
      >
        {productUtils.isMarkAsNewValid(
          product.info.markAsNewStartDate,
          product.info.markAsNewEndDate
        ) ? (
          <Text style={styles.newText}>New</Text>
        ) : null}
        {hasDiscount ? (
          <Text style={styles.discountPercentageText}>
            {highestDiscount}% off
          </Text>
        ) : null}
        <View style={[styles.imageContainer, availableStock <= 0 && { opacity: 0.5 }]}>
          <Image source={primaryImage} style={styles.image} contentFit="contain" />
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
      </Pressable>
      <View style={styles.addToCartSection}>
        {quantityInCart > 0 ? (
          <View style={styles.quantitySection}>
            <Pressable
              style={({ pressed }) => [
                styles.decrementButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDecrement}>
              <FontAwesome6 name="minus" size={10} color="#FFFFFF" />
            </Pressable>
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantityInCart}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleIncrement}>
              <FontAwesome6 name="plus" size={10} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : availableStock <= 0 ? (
          <View
            style={[
              styles.addToCartButton,
              styles.outOfStockButton,
            ]}>
            <Text style={[styles.addToCartText, styles.outOfStockButtonText]}>Out of Stock</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.addToCartButton,
              pressed && styles.addToCartButtonPressed,
            ]}
            onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>

      {error && (
        <ErrorBanner
          title={error.title}
          message={error.message}
          onDismiss={() => setError(null)}
        />
      )}
    </View >
  );
};

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    position: "relative",
    backgroundColor: theme.colors.background_3,
  },
  cardPressable: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 2,
    position: "relative",
  },
  cardPressablePressed: {
    opacity: 0.7
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
    zIndex: 10,
  },
  discountPercentageText: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#E53935",
    borderRadius: 4,
    paddingHorizontal: 10,
    lineHeight: 20,
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    zIndex: 10,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 14,
    paddingTop: 12,
    paddingBottom: 4,
    height: 150,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  nameText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    minHeight: 28,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  oldPriceText: {
    fontSize: 10,
    textDecorationLine: "line-through",
    color: "red",
    fontFamily: theme.fonts.medium,
  },
  addToCartSection: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    flexDirection: "row",
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "stretch",
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    height: 28,
    overflow: "hidden",
  },
  decrementButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  incrementButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  quantityDisplay: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.text,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  outOfStockButton: {
    backgroundColor: theme.colors.background,
    borderColor: "#9CA3AF",
    borderWidth: 1,
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
  outOfStockButtonText: {
    color: "#9CA3AF",
  },
});
