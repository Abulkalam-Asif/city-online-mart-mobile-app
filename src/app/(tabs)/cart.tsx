import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
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
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/src/hooks/useCart";
import { useCartContext } from "@/src/contexts/CartContext";
import Loading from "@/src/components/common/Loading";
import { useRefreshCartItemsStock } from "@/src/hooks/useProducts";

import { useAuth } from "@/src/contexts/AuthContext";
import { useOrderSettings, useDeliverySettings } from "@/src/hooks/useSettings";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import { useGetValidOrderDiscounts } from "@/src/hooks/useDiscounts";
import { getBestOrderDiscount } from "@/src/utils/discountUtils";
import { useIsFocused } from "@react-navigation/native";
import { Discount, ICartItem } from "@/src/types";
import { DeliverySlotSelector, SelectedSlotData } from "@/src/components/tabs/cart/DeliverySlotSelector";


export default function CartScreen() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [showMinOrderError, setShowMinOrderError] = useState(false);
  const [showSlotError, setShowSlotError] = useState(false);
  const [stockAdjustmentMessage, setStockAdjustmentMessage] = useState<string | null>(null);
  const [bestOrderDiscount, setBestOrderDiscount] = useState<Discount | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotData | null>(null);

  // Fetch settings data and valid order discounts
  const { data: orderSettings, isLoading: loadingOrderSettings } = useOrderSettings();
  const { data: deliverySettings } = useDeliverySettings();
  const { data: validOrderDiscounts, isLoading: loadingValidOrderDiscounts } = useGetValidOrderDiscounts();

  // Fetch cart data
  const { cart, loading: loadingCart, isPending: isCartPending } = useCart();
  const { updateAppliedOrderDiscount } = useCartContext();

  // Validate and auto-adjust cart items against fresh stock data
  const maxCartQuantity = orderSettings?.maxCartQuantityPerProduct || 50;

  const isFocused = useIsFocused();

  // Create a stable cartItems array ref for the hook
  const cartItemsForRefresh = useMemo(() => {
    return (cart?.items || []).map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
  }, [cart?.items]);

  const { data: stockData, isLoading: loadingStock } = useRefreshCartItemsStock(
    // Only run the query and pass items when the cart screen is actively focused
    isFocused ? cartItemsForRefresh : [],
    maxCartQuantity
  );

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
  const { mutate: updateCartItem } = updateCartItemMutation;
  const removeFromCartMutation = useRemoveFromCart();
  const { mutate: removeFromCart } = removeFromCartMutation;

  const processedStockDataRef = React.useRef<any>(null);

  // Monitor stock adjustments and apply them
  useEffect(() => {
    // Prevent this from running globally in the background
    if (!isFocused || !stockData || stockData.adjustments.length === 0) return;
    if (processedStockDataRef.current === stockData) return;

    processedStockDataRef.current = stockData;

    let messageLines: string[] = [];
    let hasChanges = false;

    stockData.adjustments.forEach((adj) => {
      if (adj.maxAllowed === 0) {
        // Item is out of stock entirely or deactivated
        messageLines.push(`â€¢ ${adj.name} is no longer available and has been removed from your cart.`);
        removeFromCart(adj.productId);
        hasChanges = true;
      } else if (adj.oldQuantity !== adj.maxAllowed) {
        // Quantity needs to be reduced
        const reasonStr = adj.reason === "exceeds_max"
          ? `You can only order a maximum of ${adj.maxAllowed} per order`
          : `Only ${adj.maxAllowed} left in stock`;

        messageLines.push(`â€¢ ${adj.name}: ${reasonStr}. Your cart has been updated.`);
        updateCartItem({
          productId: adj.productId,
          quantity: adj.maxAllowed,
        });
        hasChanges = true;
      }
    });

    if (hasChanges && messageLines.length > 0) {
      setStockAdjustmentMessage(`Some items in your cart were adjusted because of limited stock:\n\n${messageLines.join("\n")}`);
    }
  }, [stockData, removeFromCart, updateCartItem, isFocused]);

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

  const renderCartItem = useCallback(({ item }: { item: ICartItem }) => {
    // Determine limits for the cart item controls based on fresh stock data
    let availableStock = maxCartQuantity; // Fallback to maxCartQuantity if no stock data yet

    if (stockData?.freshProducts) {
      const product = stockData.freshProducts.find(p => p.id === item.productId);
      if (product) {
        const usableStock = product.batchStock?.usableStock || 0;
        const committedStock = product.batchStock?.committedStock || 0;
        availableStock = Math.max(0, usableStock - committedStock);
      }
    }

    return (
      <CartItem
        item={item}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemoveItem}
        availableStock={availableStock}
        maxCartQuantity={maxCartQuantity}
      />
    );
  }, [handleQuantityChange, handleRemoveItem, stockData, maxCartQuantity]);

  const keyExtractor = useCallback((item: ICartItem) => item.productId, []);


  const { minimumOrderAmount, orderDiscountAmount, finalSubtotal, canProceedToCheckout, isCartEmpty, totalProductDiscounts } = useMemo(() => {
    const minimumOrderAmount = orderSettings?.minimumOrderAmount || 0;
    const itemsSubtotal = cart?.itemsSubtotal || 0;

    // Calculate total product discounts
    const productDiscounts = (cart?.items || []).reduce((acc, item) => {
      const discount = (item.unitPrice - item.discountedUnitPrice) * item.quantity;
      return acc + discount;
    }, 0);

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
      totalProductDiscounts: productDiscounts,
    };
  }, [orderSettings, cart?.itemsSubtotal, cart?.items, bestOrderDiscount]);


  const handleProceed = useCallback(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!canProceedToCheckout) { setShowMinOrderError(true); return; }
    if (!selectedSlot) { setShowSlotError(true); return; }

    router.push({
      pathname: "/checkout",
      params: {
        deliverySlotDate: selectedSlot.date,
        deliverySlotId: selectedSlot.id,
        deliverySlotName: selectedSlot.name,
        deliverySlotStartTime: selectedSlot.startTime,
        deliverySlotEndTime: selectedSlot.endTime,
        deliverySlotStartTimestamp: selectedSlot.slotStartTimestamp,
        deliverySlotExpressDurationMinutes: selectedSlot.expressDurationMinutes,
      }
    });
  }, [isLoggedIn, canProceedToCheckout, selectedSlot]);

  if (loadingCart || loadingOrderSettings || loadingValidOrderDiscounts || loadingStock) {
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
            <View style={styles.sectionsWrapper}>
              <View style={styles.deliverySection}>
                <DeliverySlotSelector
                  onSelectSlot={(slot) => {
                    setSelectedSlot(slot);
                    if (slot) setShowSlotError(false);
                  }}
                  selectedSlot={selectedSlot}
                />
              </View>

              <View style={styles.itemsSection}>
                <View style={styles.itemsCountBadge}>
                  <Text style={styles.itemsCountBadgeText}>{cart?.items.length} Items</Text>
                </View>
                <FlatList
                  style={styles.container}
                  contentContainerStyle={styles.containerContent}
                  data={cart?.items}
                  renderItem={renderCartItem}
                  keyExtractor={keyExtractor}
                  showsVerticalScrollIndicator={false}
                  extraData={stockData} // Forces re-render of items when fresh stock data arrives
                />
              </View>
            </View>
            <View style={styles.summaryContainer}>
              <View style={[styles.amountRow, styles.totalRow]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.totalLabel}>Total: <Text style={styles.totalValue}>Rs. {finalSubtotal}</Text></Text>
                  {selectedSlot?.id === "fast-delivery" && (
                    <View style={styles.expressTag}>
                      <Text style={styles.expressTagText}>+⚡ Rs. {deliverySettings?.expressDeliveryFee ?? 250}</Text>
                    </View>
                  )}
                </View>
                {(totalProductDiscounts + orderDiscountAmount > 0) && (
                  <View style={styles.bachatBadge}>
                    <Text style={styles.bachatText}>Discount Rs. {totalProductDiscounts + orderDiscountAmount}</Text>
                  </View>
                )}
              </View>

              {!canProceedToCheckout && (
                <View style={styles.minimumOrderRow}>
                  <Text style={styles.minimumOrderText}>Add Rs. {minimumOrderAmount - finalSubtotal} more to meet minimum order</Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.proceedButton,
                  pressed && styles.proceedButtonPressed,
                  (!canProceedToCheckout || !selectedSlot) && isLoggedIn && styles.proceedButtonDisabled
                ]}
                disabled={isCartPending || (isLoggedIn && !canProceedToCheckout)}
                onPress={handleProceed}
              >
                <Text
                  style={styles.proceedButtonText}>
                  {isLoggedIn
                    ? "Proceed to Checkout"
                    : "Login / Create Account"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Error Banner for minimum order */}
      {showMinOrderError && (
        <ErrorBanner
          title="Minimum Order Required"
          message={`Please add Rs. ${minimumOrderAmount - finalSubtotal} more worth of items to place your order.`}
          onDismiss={() => setShowMinOrderError(false)}
        />
      )}

      {/* Error Banner for missing slot */}
      {showSlotError && (
        <ErrorBanner
          title="Delivery Slot Required"
          message={`Please select a delivery time slot before proceeding to checkout.`}
          onDismiss={() => setShowSlotError(false)}
        />
      )}

      {/* Stock Adjustment Banner */}
      {stockAdjustmentMessage && (
        <ErrorBanner
          title="Cart Adjusted"
          message={stockAdjustmentMessage}
          onDismiss={() => setStockAdjustmentMessage(null)}
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
  sectionsWrapper: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 16
  },
  deliverySection: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingBottom: 4,
  },
  itemsSection: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    position: "relative",
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 8
  },
  itemsCountBadge: {
    position: "absolute",
    top: -12,
    left: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 1,
  },
  itemsCountBadgeText: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  bachatBadge: {
    backgroundColor: '#ffebeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bachatText: {
    fontSize: 11,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.red,
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonDisabled: {
    opacity: 0.5,
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
  expressTag: {
    backgroundColor: theme.colors.express_bg,
    borderColor: theme.colors.express_border,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expressTagText: {
    fontSize: 11,
    fontFamily: theme.fonts.bold,
    color: theme.colors.express_text,
  },
});
