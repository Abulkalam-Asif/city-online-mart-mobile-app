import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import CartItem from "@/src/components/tabs/cart/CartItem";
import EmptyCart from "@/src/components/tabs/cart/EmptyCart";
import { theme } from "@/src/constants/theme";
import { router } from "expo-router";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from "@/src/hooks/useCart";
import { calculateOrderDiscount } from "@/src/utils/orderDiscounts";
import Loading from "@/src/components/common/Loading";

import { useAuth } from "@/src/contexts/AuthContext";

export default function CartScreen() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Fetch cart data
  const { data: cart, isLoading, error } = useCart();

  // Order discount state
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [discountName, setDiscountName] = useState<string | undefined>();

  // Cart mutations
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // Calculate order discount when cart changes
  useEffect(() => {
    const calculateDiscount = async () => {
      if (cart?.total) {
        try {
          const { discountAmount, discountName: name } =
            await calculateOrderDiscount(cart.total);
          setOrderDiscount(discountAmount);
          setDiscountName(name);
        } catch (error) {
          console.error("Failed to calculate order discount:", error);
          setOrderDiscount(0);
          setDiscountName(undefined);
        }
      } else {
        setOrderDiscount(0);
        setDiscountName(undefined);
      }
    };

    calculateDiscount();
  }, [cart?.total]);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    // Find the actual productId from the transformed item
    const item = cart?.items.find((_, index) => index + 1 === id);
    if (item) {
      updateCartItemMutation.mutate({
        productId: item.productId,
        quantity: newQuantity,
      },
        {
          onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to update cart item');
          },
        }
      );
    }
  };

  const handleRemoveItem = (id: number) => {
    // Find the actual productId from the transformed item
    const item = cart?.items.find((_, index) => index + 1 === id);
    if (item) {
      removeFromCartMutation.mutate(item.productId,
        {
          onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to remove cart item');
          },
        }
      );
    }
  };

  const handleClearCart = () => {
    clearCartMutation.mutate(undefined,
      {
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to clear cart');
        },
      });
  };

  if (isLoading) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />
        <View style={styles.centeringContainer}>
          <Loading text="Loading cart..." />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />
        <View style={styles.centeringContainer}>
          <Text style={styles.errorText}>Failed to load cart</Text>
        </View>
      </View>
    );
  }

  // Transform cart items to match CartItem component expectations
  const cartItems =
    cart?.items.map((item, index) => ({
      Id: index + 1, // Temporary ID for component
      MainImageUrl: item.imageUrl || require("@/src/assets/default-image.png"), // Use stored image or placeholder
      Name: item.productName,
      Price: item.unitPrice,
      OldPrice: undefined, // Could be added later
      quantity: item.quantity,
      discount: undefined,
      productId: item.productId, // Keep original ID for operations
    })) || [];

  // Check if cart meets minimum order requirement
  const cartTotal = cart?.total || 0;
  const finalTotal = cartTotal - orderDiscount;
  const minimumOrderAmount = 1500;
  const canProceedToCheckout = cartTotal >= minimumOrderAmount;

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="My Cart" />

      {isCartEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.itemsCountText}>{cartItems.length} items</Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={handleClearCart}
                style={({ pressed }) => [
                  pressed && styles.clearCartButtonPressed,
                ]}>
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
              <Text
                style={[styles.minimumOrderText, styles.minimumOrderValueText]}>
                1500
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Subtotal</Text>
              <Text style={styles.amountValue}>Rs. {cart?.total || 0}</Text>
            </View>

            {orderDiscount > 0 && (
              <View style={styles.amountRow}>
                <Text style={styles.discountLabel}>
                  Order Discount{discountName ? ` (${discountName})` : ""}
                </Text>
                <Text style={styles.discountValue}>-Rs. {orderDiscount}</Text>
              </View>
            )}

            <View style={[styles.amountRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {finalTotal}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.proceedButton,
                !canProceedToCheckout && styles.proceedButtonDisabled,
                pressed && canProceedToCheckout && styles.proceedButtonPressed,
              ]}
              onPress={() => {
                if (!canProceedToCheckout) return;

                if (isLoggedIn) {
                  router.push("/checkout");
                } else {
                  router.push("/login");
                }
              }}
              disabled={!canProceedToCheckout}>
              <Text
                style={[
                  styles.proceedButtonText,
                  !canProceedToCheckout && styles.proceedButtonTextDisabled,
                ]}>
                {isLoggedIn
                  ? canProceedToCheckout
                    ? "Proceed to Checkout"
                    : `Add Rs. ${minimumOrderAmount - cartTotal
                    } more to proceed`
                  : "Login /Create Account"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
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
    justifyContent: "flex-end",
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
  discountLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },
  discountValue: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonDisabled: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.placeholder,
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  proceedButtonTextDisabled: {
    color: theme.colors.text_secondary,
  },
  proceedButtonPressed: {
    opacity: 0.8,
  },

  centeringContainer: {
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
