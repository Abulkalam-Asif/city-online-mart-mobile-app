import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAddToCart, useUpdateCartItem } from "@/src/hooks/useCart";
import { router } from "expo-router";
import { useOrderSettings } from "@/src/hooks/useSettings";
import ErrorBanner from "@/src/components/common/ErrorBanner";

type AddToCartContainerProps = {
  productId: string;
  productName: string;
  unitPrice: number;
  discountPercentage: number;
  appliedDiscountId: string | undefined;
  appliedDiscountSource: string | undefined;
  imageUrl: string;
  discountedPrice: number;
  quantityInCart: number;
  availableStock: number;
};

const AddToCartContainer = ({
  productId,
  productName,
  unitPrice,
  discountPercentage,
  appliedDiscountId,
  appliedDiscountSource,
  imageUrl,
  discountedPrice,
  quantityInCart,
  availableStock,
}: AddToCartContainerProps) => {
  // Cart mutations
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();

  // State
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  // Settings
  const { data: orderSettings } = useOrderSettings();
  const maxCartQuantity = orderSettings?.maxCartQuantityPerProduct || 50;


  // Event handlers
  const handleDecrement = useCallback(() => {
    if (quantityInCart > 1) {
      updateCartItemMutation.mutate({
        productId,
        quantity: quantityInCart - 1,
      });
    } else {
      // If quantity is 1, remove the item
      updateCartItemMutation.mutate({
        productId,
        quantity: 0,
      });
    }
  }, [quantityInCart, productId, updateCartItemMutation]);

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
      productId,
      quantity: newQuantity,
    });
  }, [quantityInCart, productId, updateCartItemMutation, availableStock, maxCartQuantity]);

  const handleAddOrViewCart = useCallback(() => {
    if (quantityInCart === 0) {
      if (availableStock < 1) {
        setError({
          title: "Out of Stock",
          message: "This item is currently out of stock."
        });
        return;
      }

      // Add to cart for first time
      addToCartMutation.mutate({
        productId,
        productName,
        unitPrice,
        discountPercentage,
        appliedDiscountId,
        appliedDiscountSource,
        imageUrl,
        quantity: 1,
      });
    } else {
      // Navigate to cart
      router.push("/cart");
    }
  }, [quantityInCart, productId, addToCartMutation, productName, unitPrice, discountPercentage, appliedDiscountId, appliedDiscountSource, imageUrl, availableStock])

  return (
    <View style={styles.container}>
      {quantityInCart > 0 && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>Amount</Text>
          <Text style={styles.amountValueText}>
            Rs. {discountedPrice * quantityInCart}
          </Text>
        </View>
      )}

      <View style={styles.addToCartSection}>
        {quantityInCart > 0 && (
          <View style={styles.quantitySection}>
            <Pressable
              style={({ pressed }) => [
                styles.quantityChangeButton,
                pressed && styles.quantityChangeButtonPressed,
              ]}
              onPress={handleDecrement}
            >
              <FontAwesome6 size={20} name="minus" />
            </Pressable>
            <Text style={styles.quantityText}>{quantityInCart}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.quantityChangeButton,
                pressed && styles.quantityChangeButtonPressed,
              ]}
              onPress={handleIncrement}>
              <FontAwesome6 size={20} name="plus" />
            </Pressable>
          </View>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.addToCartButton,
            pressed && styles.addToCartButtonPressed,
          ]}
          onPress={handleAddOrViewCart}
        >
          <Text style={styles.addToCartText}>
            {quantityInCart === 0 ? "Add to Cart" : `View cart`}
          </Text>
        </Pressable>
      </View>

      {error && (
        <ErrorBanner
          title={error.title}
          message={error.message}
          onDismiss={() => setError(null)}
        />
      )}
    </View>
  );
};

export default AddToCartContainer;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },

  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  amountText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
  },
  amountValueText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },

  addToCartSection: {
    flexDirection: "row",
    gap: 8,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 30,
  },
  quantityChangeButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    padding: 11,
    borderRadius: 30,
  },
  quantityChangeButtonPressed: {
    backgroundColor: theme.colors.background,
  },
  quantityText: {
    fontFamily: theme.fonts.medium,
    flex: 1,
    textAlign: "center",
    fontSize: 18,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
  },
  addToCartButtonPressed: {
    opacity: 0.8,
  },
  addToCartText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: theme.fonts.semibold,
  },
});
