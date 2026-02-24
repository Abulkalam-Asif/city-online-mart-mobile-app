import { StyleSheet, Text, View, Pressable } from "react-native";
import React, { useCallback } from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { ICartItem } from "@/src/types";

type CartItemProps = {
  item: ICartItem;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
};

const CartItem = ({ item, onQuantityChange, onRemove }: CartItemProps) => {
  const handleIncrement = useCallback(() => {
    onQuantityChange(item.productId, item.quantity + 1);
  }, [item.productId, onQuantityChange]);

  const handleDecrement = useCallback(() => {
    if (item.quantity > 1) {
      onQuantityChange(item.productId, item.quantity - 1);
    }
  }, [item.productId, onQuantityChange]);

  const handleRemove = useCallback(() => {
    onRemove(item.productId);
  }, [item.productId, onRemove]);

  return (
    <View
      style={styles.itemCard}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={item.imageUrl}
          style={styles.productImage}
          contentFit="contain"
        />
      </View>

      {/* Product Details */}
      <Pressable style={({ pressed }) => [styles.detailsContainer, pressed && styles.detailsContainerPressed]}
        onPress={() => router.push({
          pathname: "/product-details",
          params: { id: item.productId },
        })}
      >
        <Text style={styles.productNameText} numberOfLines={2}>
          {item.productName}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.discountedUnitPriceText}>Rs. {item.discountedUnitPrice * item.quantity}</Text>
          {item.discountPercentage > 0 && (
            <Text style={styles.unitPriceText}>Rs. {item.unitPrice * item.quantity}</Text>
          )}
          {item.discountPercentage > 0 && (
            <Text style={styles.discountTag}>{`${item.discountPercentage}% off`}</Text>
          )}
        </View>
      </Pressable>

      {/* Quantity Controls */}
      <View style={styles.quantityContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed,
          ]}
          onPress={item.quantity > 1 ? handleDecrement : handleRemove}>
          {item.quantity > 1 ? (
            <FontAwesome6 name="minus" size={14} color={theme.colors.text} />
          ) : (
            <FontAwesome6 name="trash" size={14} color={theme.colors.text} />
          )}
        </Pressable>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed,
          ]}
          onPress={handleIncrement}>
          <FontAwesome6 name="plus" size={14} color={theme.colors.text} />
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(CartItem);

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 1,
    alignItems: "center",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  productImage: {
    width: 50,
    height: 50,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  detailsContainerPressed: {
    opacity: 0.7
  },
  productNameText: {
    fontSize: 12,
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
  discountedUnitPriceText: {
    fontSize: 13,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  unitPriceText: {
    fontSize: 11,
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
    paddingVertical: 1,
    borderRadius: 10,
    color: "black",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  quantityButtonPressed: {
    backgroundColor: theme.colors.background,
  },
  quantityText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#333",
    minWidth: 30,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
