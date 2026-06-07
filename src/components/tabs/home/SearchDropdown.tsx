import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { router } from "expo-router";
import { theme } from "@/src/constants/theme";
import { Product } from "@/src/types";
import { useProductSearch } from "@/src/hooks/useProducts";
import { useSinglePress } from "@/src/hooks/useSinglePress";
import { useCart, useAddToCart, useUpdateCartItem } from "@/src/hooks/useCart";
import { FontAwesome6 } from "@expo/vector-icons";
import { useOrderSettings } from "@/src/hooks/useSettings";
import ErrorBanner from "@/src/components/common/ErrorBanner";

type SearchDropdownProps = {
  searchTerm: string;
};

const SearchDropdownItem = ({ product, canPress }: { product: Product, canPress: () => boolean }) => {
  const { cart } = useCart();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const { data: orderSettings } = useOrderSettings();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  const maxCartQuantity = orderSettings?.maxCartQuantityPerProduct || 50;

  const quantityInCart = useMemo(
    () => cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0,
    [cart?.items, product.id]
  );

  const availableStock = useMemo(() => {
    const usableStock = product.batchStock?.usableStock || 0;
    const committedStock = product.batchStock?.committedStock || 0;
    return Math.max(0, usableStock - committedStock);
  }, [product.batchStock]);

  const bestDiscount = useMemo(() =>
    product.validApplicableDiscounts?.reduce(
      (best, current) => (current.percentage > (best?.percentage || 0) ? current : best),
      null as typeof product.validApplicableDiscounts[0] | null
    ), [product.validApplicableDiscounts]
  );

  const highestDiscount = bestDiscount?.percentage || 0;
  const discountedPrice = highestDiscount > 0
    ? Math.floor(product.price * (1 - highestDiscount / 100))
    : product.price;

  const primaryImage = product.multimedia?.images?.[0] || require("@/src/assets/default-image.png");

  const handleProductPress = () => {
    if (!canPress()) return;
    router.push({
      pathname: "/product-details",
      params: { id: product.id },
    });
  };

  const handleAdd = useCallback(() => {
    if (availableStock < 1) {
      setError({
        title: "Out of Stock",
        message: "This item is currently out of stock."
      });
      return;
    }
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
  }, [availableStock, product, highestDiscount, bestDiscount, primaryImage, addToCartMutation]);

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
  }, [quantityInCart, availableStock, maxCartQuantity, product.id, updateCartItemMutation]);

  const handleDecrement = useCallback(() => {
    updateCartItemMutation.mutate({
      productId: product.id,
      quantity: quantityInCart - 1,
    });
  }, [quantityInCart, product.id, updateCartItemMutation]);

  return (
    <Pressable
      style={({ pressed }) => [styles.resultItem, pressed && styles.resultItemPressed]}
      onPress={handleProductPress}
    >
      <Image source={primaryImage} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.info.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>Rs. {discountedPrice}</Text>
          {highestDiscount > 0 && (
            <Text style={styles.oldPriceText}>Rs. {product.price}</Text>
          )}
        </View>
        {availableStock < 1 && (
          <Text style={styles.outOfStockText}>Out of stock</Text>
        )}
      </View>

      {/* Add To Cart Section */}
      <View style={styles.cartActionContainer}>
        {quantityInCart === 0 ? (
          <Pressable 
            style={({ pressed }) => [
              styles.circularAddButton, 
              availableStock < 1 && styles.buttonDisabled,
              pressed && availableStock >= 1 && styles.buttonPressed
            ]} 
            onPress={handleAdd}
            disabled={availableStock < 1}
          >
            <FontAwesome6 name="plus" size={14} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.quantityControl}>
            <Pressable 
              style={({ pressed }) => [styles.qtyBtn, pressed && styles.buttonPressed]} 
              onPress={handleDecrement}
            >
              <FontAwesome6 name="minus" size={12} color="#fff" />
            </Pressable>
            <Text style={styles.qtyText}>{quantityInCart}</Text>
            <Pressable 
              style={({ pressed }) => [styles.qtyBtn, pressed && styles.buttonPressed]} 
              onPress={handleIncrement}
            >
              <FontAwesome6 name="plus" size={12} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>

      {error && (
        <ErrorBanner
          title={error.title}
          message={error.message}
          onDismiss={() => setError(null)}
        />
      )}
    </Pressable>
  );
};

const SearchDropdown: React.FC<SearchDropdownProps> = ({ searchTerm }) => {
  const { data: products, isLoading } = useProductSearch(searchTerm);
  const canPress = useSinglePress();

  if (!searchTerm.trim()) return null;

  return (
    <View style={styles.container}>
      {searchTerm.trim().length < 3 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Please enter at least 3 characters to search.
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : products?.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No products found for "{searchTerm}"</Text>
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContainer}
          nestedScrollEnabled={true}
        >
          {products?.map((product) => (
            <SearchDropdownItem key={product.id} product={product} canPress={canPress} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default SearchDropdown;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 70, // Below the search bar
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: 300, // Half-screen scrollable
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
    overflow: "hidden",
  },
  centerContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: theme.colors.text_secondary,
    fontFamily: theme.fonts.medium,
    fontSize: 12,
  },
  emptyText: {
    color: theme.colors.text_secondary,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background_3,
    alignItems: "center",
  },
  resultItemPressed: {
    backgroundColor: theme.colors.background_3,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    objectFit: "contain",
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.text,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  priceText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.secondary,
  },
  oldPriceText: {
    fontFamily: theme.fonts.regular,
    fontSize: 10,
    color: "red",
    textDecorationLine: "line-through",
  },
  cartActionContainer: {
    minWidth: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  circularAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    overflow: "hidden",
    height: 32,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "#fff",
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.placeholder,
    opacity: 0.5,
  },
  outOfStockText: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: "red",
    marginTop: 2,
  },
});
