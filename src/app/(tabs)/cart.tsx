import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import CartItem from "@/src/components/tabs/cart/CartItem";
import { theme } from "@/src/constants/theme";
import { router } from "expo-router";
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart, useAddToCart } from "@/src/hooks/useCart";

export default function CartScreen() {
  const isLoggedIn = true;

  // Fetch cart data
  const { data: cart, isLoading, error } = useCart();

  // Cart mutations
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  const handleQuantityChange = (id: number, newQuantity: number) => {
    // Find the actual productId from the transformed item
    const item = cart?.items.find((_, index) => index + 1 === id);
    if (item) {
      updateCartItemMutation.mutate({ productId: item.productId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (id: number) => {
    // Find the actual productId from the transformed item
    const item = cart?.items.find((_, index) => index + 1 === id);
    if (item) {
      removeFromCartMutation.mutate(item.productId);
    }
  };

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load cart</Text>
        </View>
      </View>
    );
  }

  // Transform cart items to match CartItem component expectations
  const cartItems = cart?.items.map((item, index) => ({
    Id: index + 1, // Temporary ID for component
    MainImageUrl: require("@/src/assets/default-image.png"), // Placeholder
    Name: item.productName,
    Price: item.unitPrice,
    OldPrice: undefined, // Could be added later
    quantity: item.quantity,
    discount: undefined,
    productId: item.productId, // Keep original ID for operations
  })) || [];

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="My Cart" />
      <View style={styles.infoContainer}>
        <Text style={styles.itemsCountText}>{cartItems.length} items</Text>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => addToCartMutation.mutate({
              productId: `product${Date.now()}`,
              productName: `Test Product ${cartItems.length + 1}`,
              unitPrice: Math.floor(Math.random() * 500) + 100,
              batchId: `batch${Date.now()}`,
            })}
            style={({ pressed }) => [
              styles.addItemButton,
              pressed && styles.addItemButtonPressed,
            ]}>
            <Text style={styles.addItemText}>Add Test Item</Text>
          </Pressable>
          <Pressable
            onPress={handleClearCart}
            style={({ pressed }) => [pressed && styles.clearCartButtonPressed]}>
            <Text style={styles.clearCartText}>Clear All</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        data={cartItems}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        )}
        keyExtractor={(item) => item.Id.toString()}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.summaryContainer}>
        <View style={styles.minimumOrderRow}>
          <Text style={styles.minimumOrderText}>Minimum Order Price: </Text>
          <Text style={[styles.minimumOrderText, styles.minimumOrderValueText]}>
            1500
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            Rs. {cart?.total || 0}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.proceedButton,
            pressed && styles.proceedButtonPressed,
          ]}
          onPress={() => {
            if (isLoggedIn) {
              router.push("/checkout");
            } else {
              router.push("/login");
            }
          }}>
          <Text style={styles.proceedButtonText}>
            {isLoggedIn ? "Proceed to Checkout" : "Login /Create Account"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },

  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  itemsCountText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  addItemButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },
  addItemButtonPressed: {
    opacity: 0.8,
  },
  addItemText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: "#fff",
    textAlign: "center",
  },
  clearCartButtonPressed: {
    opacity: 0.6,
  },
  clearCartText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: "red",
  },
  containerContent: {
    paddingBottom: 20,
  },

  summaryContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 4,
  },
  minimumOrderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  minimumOrderText: {
    fontSize: 10,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
  minimumOrderValueText: {
    fontFamily: theme.fonts.semibold,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  amountValue: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  proceedButtonPressed: {
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: "red",
  },
});
