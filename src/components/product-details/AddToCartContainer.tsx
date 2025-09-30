import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";

type AddToCartContainerProps = {
  quantityInCart: number;
  setQuantityInCart: (quantity: number) => void;
  price: number;
};

const AddToCartContainer = ({
  quantityInCart,
  setQuantityInCart,
  price,
}: AddToCartContainerProps) => {
  return (
    <View style={styles.container}>
      {quantityInCart > 0 && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>Amount</Text>
          <Text style={styles.amountValueText}>
            Rs. {price * quantityInCart}
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
              onPress={() => setQuantityInCart(quantityInCart - 1)}>
              <FontAwesome6 size={20} name="minus" />
            </Pressable>
            <Text style={styles.quantityText}>{quantityInCart}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.quantityChangeButton,
                pressed && styles.quantityChangeButtonPressed,
              ]}
              onPress={() => setQuantityInCart(quantityInCart + 1)}>
              <FontAwesome6 size={20} name="plus" />
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
    fontFamily: theme.fonts.semi_bold,
  },
  amountValueText: {
    fontSize: 16,
    fontFamily: theme.fonts.semi_bold,
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
    fontFamily: theme.fonts.semi_bold,
  },
});
