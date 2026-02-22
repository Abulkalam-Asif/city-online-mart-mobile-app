import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from "@/src/hooks/useCart";
import { useCartContext } from "@/src/contexts/CartContext";
import Loading from "@/src/components/common/Loading";

import { useAuth } from "@/src/contexts/AuthContext";
import { useOrderSettings } from "@/src/hooks/useSettings";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import { useGetValidOrderDiscounts } from "@/src/hooks/useDiscounts";
import { getBestOrderDiscount } from "@/src/utils/discountUtils";
import { Discount, ICartItem } from "@/src/types";


export default function CartScreen() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [showMinOrderError, setShowMinOrderError] = useState(false);
  const [bestOrderDiscount, setBestOrderDiscount] = useState<Discount | null>(null);

  // Fetch settings data and valid order discounts
  const { data: orderSettings, isLoading: loadingOrderSettings } = useOrderSettings();
  const { data: validOrderDiscounts, isLoading: loadingValidOrderDiscounts } = useGetValidOrderDiscounts();

  // Fetch cart data
  const { cart, loading: loadingCart, isPending: isCartPending } = useCart();
  const { updateAppliedOrderDiscount } = useCartContext();

  // Calculate best order discount
  useEffect(() => {
    if (loadingValidOrderDiscounts || !validOrderDiscounts || !cart) return;

    const best = getBestOrderDiscount(validOrderDiscounts, cart.itemsSubtotal);
    setBestOrderDiscount(best);

    // Update context if best discount changed
    const currentApplied = cart.appliedOrderDiscount;
    if (best) {
      const amount = Math.round((cart.itemsSubtotal * best.percentage) / 100);
      if (currentApplied?.id !== best.id || currentApplied?.amount !== amount) {
        updateAppliedOrderDiscount(best.id, best.name, best.percentage, amount);
      }
    } else if (currentApplied) {
      // Clear discount if none apply anymore
      updateAppliedOrderDiscount("", "", 0, 0);
    }
  }, [validOrderDiscounts, cart?.itemsSubtotal, loadingValidOrderDiscounts]);

  // Cart mutations
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    // Find the actual productId from the transformed item
    const item = cart?.items.find((item) => item.productId === productId);
    if (item) {
      updateCartItemMutation.mutate({
        productId: item.productId,
        quantity: newQuantity,
      });
    }
  }, [cart?.items, updateCartItemMutation]);

  const handleRemoveItem = useCallback((productId: string) => {
    // Find the actual productId from the transformed item
    const item = cart?.items.find((item) => item.productId === productId);
    if (item) {
      removeFromCartMutation.mutate(item.productId);
    }
  }, [cart?.items, removeFromCartMutation]);

  const handleClearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation])

  const { minimumOrderAmount, itemsSubtotal, orderDiscountAmount, finalSubtotal, canProceedToCheckout, isCartEmpty } = useMemo(() => {
    const minimumOrderAmount = orderSettings?.minimumOrderAmount || 0;
    const itemsSubtotal = cart?.itemsSubtotal || 0;
    const orderDiscountAmount = bestOrderDiscount
      ? Math.round((itemsSubtotal * bestOrderDiscount.percentage) / 100)
      : 0;
    const finalSubtotal = itemsSubtotal - orderDiscountAmount;
    return {
      minimumOrderAmount,
      itemsSubtotal,
      orderDiscountAmount,
      finalSubtotal,
      canProceedToCheckout: finalSubtotal >= minimumOrderAmount,
      isCartEmpty: cart?.items.length === 0,
    };
  }, [orderSettings, cart?.itemsSubtotal, cart?.items.length, bestOrderDiscount]);


  const renderCartItem = useCallback(({ item }: { item: ICartItem }) => (
    <CartItem item={item} onQuantityChange={handleQuantityChange} onRemove={handleRemoveItem} />
  ), [handleQuantityChange, handleRemoveItem]);

  const keyExtractor = useCallback((item: ICartItem) => item.productId, []);

  const handleProceed = useCallback(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!canProceedToCheckout) { setShowMinOrderError(true); return; }
    router.push("/checkout");
  }, [isLoggedIn, canProceedToCheckout]);

  if (loadingCart || loadingOrderSettings || loadingValidOrderDiscounts) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />
        <View style={styles.centeringContainer}>
          <Loading text="Loading cart..." />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />

        {isCartEmpty ? (
          <EmptyCart />
        ) : (
          <>
            <View style={styles.infoContainer}>
              <Text style={styles.itemsCountText}>{cart?.items.length} items</Text>
              <View style={styles.buttonRow}>
                <Pressable
                  onPress={handleClearCart}
                  disabled={isCartPending}
                  style={({ pressed }) => [
                    pressed && styles.clearCartButtonPressed,
                  ]}>
                  <Text style={[styles.clearCartText]}>Clear All</Text>
                </Pressable>
              </View>
            </View>
            <FlatList
              style={styles.container}
              contentContainerStyle={styles.containerContent}
              data={cart?.items}
              renderItem={renderCartItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.summaryContainer}>
              <View style={styles.minimumOrderRow}>
                <Text style={styles.minimumOrderText}>Minimum Order Subtotal: </Text>
                <Text
                  style={[styles.minimumOrderText, styles.minimumOrderValueText]}>
                  {minimumOrderAmount}
                </Text>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Items Subtotal</Text>
                <Text style={styles.amountValue}>Rs. {cart?.itemsSubtotal || 0}</Text>
              </View>

              {bestOrderDiscount && (
                <View style={styles.amountRow}>
                  <View style={styles.discountLabelContainer}>
                    <Text style={styles.discountLabel}>
                      Order Discount
                    </Text>
                    <Text style={styles.discountTag}>
                      {bestOrderDiscount.percentage}% off
                    </Text>
                  </View>
                  <Text style={styles.discountValue}>Rs. {orderDiscountAmount}</Text>
                </View>
              )}

              <View style={[styles.amountRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Order Subtotal</Text>
                <Text style={styles.totalValue}>Rs. {finalSubtotal}</Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.proceedButton,
                  pressed && styles.proceedButtonPressed,
                ]}
                disabled={isCartPending}
                onPress={handleProceed}
              >
                <Text
                  style={styles.proceedButtonText}>
                  {isLoggedIn
                    ? canProceedToCheckout
                      ? "Proceed to Checkout"
                      : `Add Rs. ${minimumOrderAmount - finalSubtotal
                      } more to proceed`
                    : "Login / Create Account"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Error Banner */}
      {showMinOrderError && (
        <ErrorBanner
          title="Minimum Order Required"
          message={`Please add Rs. ${minimumOrderAmount - finalSubtotal} more worth of items to place your order.`}
          onDismiss={() => setShowMinOrderError(false)}
        />
      )}
    </>
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
  discountLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  proceedButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
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
