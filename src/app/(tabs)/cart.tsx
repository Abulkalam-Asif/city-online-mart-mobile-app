import { formatPrice } from "@/src/utils/formatPrice";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import PrimaryButton from "@/src/components/general/PrimaryButton";
import ScreenFooter from "@/src/components/general/ScreenFooter";
import CartItem from "@/src/components/tabs/cart/CartItem";
import EmptyCart from "@/src/components/tabs/cart/EmptyCart";
import { theme } from "@/src/constants/theme";
import { router } from "expo-router";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/src/hooks/useCart";
import { CartItemPriceUpdate, useCartContext } from "@/src/contexts/CartContext";
import EmptyState from "@/src/components/common/EmptyState";
import CartSkeleton from "@/src/components/tabs/cart/CartSkeleton";
import { useRefreshCartItemsStock } from "@/src/hooks/useProducts";

import { useAuth } from "@/src/contexts/AuthContext";
import { useOrderSettings, useDeliverySettings } from "@/src/hooks/useSettings";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import { useGetValidOrderDiscounts } from "@/src/hooks/useDiscounts";
import { getBestProductDiscount, getDiscountedPrice } from "@/src/utils/discountUtils";
import { getNextOfferHint, pickOrderOffer } from "@/src/utils/orderOffers";
import OrderDiscountNotice from "@/src/components/tabs/cart/OrderDiscountNotice";
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
  // Free delivery never applies to Express, so the winning order offer depends on the slot type
  const isExpress = selectedSlot?.id === "fast-delivery";
  // Percentage of an order discount that has just started (or got higher), shown for a few seconds.
  const [newDiscountPercentage, setNewDiscountPercentage] = useState<number | null>(null);
  // null until the first calculation, so opening a cart that already has a discount shows no notice.
  const lastDiscountPercentageRef = React.useRef<number | null>(null);

  // Fetch settings data and valid order discounts
  const { data: orderSettings, isLoading: loadingOrderSettings, isError: orderSettingsFailed, refetch: refetchOrderSettings } = useOrderSettings();
  const { data: deliverySettings } = useDeliverySettings();
  const { data: validOrderDiscounts, isLoading: loadingValidOrderDiscounts, isError: discountsFailed, refetch: refetchDiscounts } = useGetValidOrderDiscounts();

  // Fetch cart data
  const { cart, loading: loadingCart, isPending: isCartPending } = useCart();
  const { updateAppliedOrderDiscount, updateCartItemPrices } = useCartContext();

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

  const { data: stockData, isLoading: loadingStock, isError: stockFailed, refetch: refetchStock } = useRefreshCartItemsStock(
    // Only run the query and pass items when the cart screen is actively focused
    isFocused ? cartItemsForRefresh : [],
    maxCartQuantity
  );

  // Calculate best order discount
  useEffect(() => {
    if (loadingValidOrderDiscounts || !validOrderDiscounts || !cart) return;

    // Only a percentage offer is applied to the cart; a free delivery win only changes the delivery fee
    const offer = pickOrderOffer(validOrderDiscounts, cart.itemsSubtotal, { isExpress });
    const best = offer?.kind === "percentage" ? offer.discount : null;
    setBestOrderDiscount(best);

    const percentage = best?.percentage ?? 0;
    const lastPercentage = lastDiscountPercentageRef.current;
    if (lastPercentage !== null && percentage > lastPercentage) setNewDiscountPercentage(percentage);
    lastDiscountPercentageRef.current = percentage;

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
  }, [validOrderDiscounts, cart?.itemsSubtotal, loadingValidOrderDiscounts, isExpress]);

  // Hide the new-discount notice again after a few seconds (a higher discount restarts the time).
  useEffect(() => {
    if (newDiscountPercentage === null) return;
    const timer = setTimeout(() => setNewDiscountPercentage(null), 4000);
    return () => clearTimeout(timer);
  }, [newDiscountPercentage]);

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
        messageLines.push(`• ${adj.name} is no longer available and has been removed from your cart.`);
        removeFromCart(adj.productId);
        hasChanges = true;
      } else if (adj.oldQuantity !== adj.maxAllowed) {
        // Quantity needs to be reduced
        const reasonStr = adj.reason === "exceeds_max"
          ? `You can only order a maximum of ${adj.maxAllowed} per order`
          : `Only ${adj.maxAllowed} left in stock`;

        messageLines.push(`• ${adj.name}: ${reasonStr}. Your cart has been updated.`);
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

  const processedPriceDataRef = React.useRef<any>(null);

  // Items keep the price and discount they were added with. When the fresh products arrive, bring
  // them up to date (a discount may have been added, changed or ended), so the cart and checkout
  // show what the order will cost, and tell the customer about every price that changed.
  useEffect(() => {
    if (!isFocused || !stockData || !cart) return;
    if (processedPriceDataRef.current === stockData) return;

    processedPriceDataRef.current = stockData;

    const updates: CartItemPriceUpdate[] = [];
    const changedLines: string[] = [];

    cart.items.forEach((item) => {
      const product = stockData.freshProducts.find((p) => p.id === item.productId);
      if (!product) return;

      const bestDiscount = getBestProductDiscount(product.validApplicableDiscounts || []);
      const percentage = bestDiscount?.percentage || 0;
      const newPrice = getDiscountedPrice(product.price, percentage);
      if (
        product.price === item.unitPrice &&
        percentage === item.discountPercentage &&
        bestDiscount?.id === item.appliedDiscountId &&
        newPrice === item.discountedUnitPrice
      ) return;

      updates.push({
        productId: item.productId,
        unitPrice: product.price,
        discountPercentage: percentage,
        appliedDiscountId: bestDiscount?.id,
        appliedDiscountSource: bestDiscount?.source,
      });

      if (newPrice !== item.discountedUnitPrice) {
        changedLines.push(`• ${item.productName}: now Rs. ${formatPrice(newPrice)} each (was Rs. ${formatPrice(item.discountedUnitPrice)})`);
      }
    });

    if (updates.length === 0) return;
    updateCartItemPrices(updates);

    if (changedLines.length > 0) {
      const text = `Some prices in your cart have changed:\n\n${changedLines.join("\n")}`;
      setStockAdjustmentMessage((prev) => (prev ? `${prev}\n\n${text}` : text));
    }
  }, [stockData, cart, isFocused, updateCartItemPrices]);

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


  const { minimumOrderAmount, orderDiscountAmount, finalSubtotal, nextOffer, freeDeliveryApplied, canProceedToCheckout, isCartEmpty, totalProductDiscounts } = useMemo(() => {
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
    const appliedOffer = pickOrderOffer(validOrderDiscounts || [], itemsSubtotal, { isExpress });
    const nextOffer = getNextOfferHint(validOrderDiscounts || [], itemsSubtotal, appliedOffer, { isExpress });
    return {
      minimumOrderAmount,
      itemsSubtotal,
      orderDiscountAmount,
      finalSubtotal,
      nextOffer,
      freeDeliveryApplied: appliedOffer?.kind === "free_delivery",
      canProceedToCheckout: finalSubtotal >= minimumOrderAmount,
      isCartEmpty: cart?.items.length === 0,
      totalProductDiscounts: productDiscounts,
    };
  }, [orderSettings, validOrderDiscounts, cart?.itemsSubtotal, cart?.items, bestOrderDiscount, isExpress]);


  const handleProceed = useCallback(() => {
    if (!isLoggedIn) { router.push({ pathname: "/login", params: { redirect: "/cart" } }); return; }
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

  // An empty cart needs none of the settings, discounts or stock, so it is shown right away.
  const loadingDetails = loadingOrderSettings || loadingValidOrderDiscounts || loadingStock;
  if (loadingCart || (!isCartEmpty && loadingDetails)) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />
        <CartSkeleton />
      </View>
    );
  }

  // Minimum order, discounts and stock limits decide what the customer sees and can order,
  // so the cart is not shown with them missing (a total without them would be wrong).
  const detailsFailed =
    (orderSettingsFailed && !orderSettings) ||
    (discountsFailed && !validOrderDiscounts) ||
    (stockFailed && !stockData);
  if (!isCartEmpty && detailsFailed) {
    return (
      <View style={styles.mainContainer}>
        <GeneralTopBar text="My Cart" />
        <View style={styles.centeringContainer}>
          <EmptyState
            tone="error"
            title="Couldn't load your cart"
            message="Check your connection and try again."
            actionText="Retry"
            onAction={() => {
              if (orderSettingsFailed) refetchOrderSettings();
              if (discountsFailed) refetchDiscounts();
              if (stockFailed) refetchStock();
            }}
          />
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
            <View>
              {newDiscountPercentage !== null && orderDiscountAmount > 0 && (
                <OrderDiscountNotice percentage={newDiscountPercentage} amount={orderDiscountAmount} />
              )}
            <ScreenFooter>
              <View style={[styles.amountRow, styles.totalRow]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.totalLabel}>Total: <Text style={styles.totalValue}>Rs. {formatPrice(finalSubtotal)}</Text></Text>
                  {selectedSlot?.id === "fast-delivery" && (
                    <View style={styles.expressTag}>
                      <Text style={styles.expressTagText}>+⚡ Rs. {formatPrice(deliverySettings?.expressDeliveryFee ?? 250)}</Text>
                    </View>
                  )}
                </View>
                {(totalProductDiscounts + orderDiscountAmount > 0) && (
                  <View style={styles.bachatBadge}>
                    <Text style={styles.bachatText}>Discount Rs. {formatPrice(totalProductDiscounts + orderDiscountAmount)}</Text>
                  </View>
                )}
              </View>

              {!canProceedToCheckout && (
                <View style={styles.minimumOrderRow}>
                  <Text style={styles.minimumOrderText}>Add Rs. {formatPrice(minimumOrderAmount - finalSubtotal)} more to meet minimum order</Text>
                </View>
              )}

              {/* The minimum-order hint comes first; the offer hints wait until the order can go ahead. */}
              {canProceedToCheckout && nextOffer && (
                <View style={styles.minimumOrderRow}>
                  <Text style={styles.nextDiscountText}>
                    {nextOffer.kind === "free_delivery"
                      ? `Add Rs. ${formatPrice(nextOffer.remaining)} more to get free delivery`
                      : `Add Rs. ${formatPrice(nextOffer.remaining)} more to get ${nextOffer.percentage}% off your order`}
                  </Text>
                </View>
              )}
              {canProceedToCheckout && !nextOffer && freeDeliveryApplied && (
                <View style={styles.minimumOrderRow}>
                  <Text style={styles.nextDiscountText}>Free delivery unlocked</Text>
                </View>
              )}

              <PrimaryButton
                label={isLoggedIn ? "Proceed to Checkout" : "Login / Create Account"}
                onPress={() => {
                  if (!isCartPending) handleProceed();
                }}
                disabled={isLoggedIn && !canProceedToCheckout}
                dimmed={isLoggedIn && !selectedSlot}
              />
            </ScreenFooter>
            </View>
          </>
        )}
      </View>

      {/* Error Banner for minimum order */}
      {showMinOrderError && (
        <ErrorBanner
          title="Minimum Order Required"
          message={`Please add Rs. ${formatPrice(minimumOrderAmount - finalSubtotal)} more worth of items to place your order.`}
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
    paddingTop: 12, // keeps the delivery card's top border off the header's bottom edge
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
  nextDiscountText: {
    fontSize: 11,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
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
