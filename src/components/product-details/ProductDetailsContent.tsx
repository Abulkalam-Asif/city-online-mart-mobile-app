import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { theme } from "@/src/constants/theme";
import { Product, StockStatus } from "@/src/types";
import AddToCartContainer from "./AddToCartContainer";
import ImagesCarousel from "./ImagesCarousel";
import ProductDetailsTopBg from "./ProductDetailsTopBg";
import ProductDetailsTopBar from "./ProductDetailsTopBar";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/src/hooks/useCart";
import SimilarProductsSection from "./SimilarProductsSection";

type ProductDetailsContentProps = {
  product: Product,
};

const getStockStatusColor = (status: StockStatus): string => {
  switch (status) {
    case "In Stock":
      return "green";
    case "Out of Stock":
      return "red";
    case "Low Stock":
      return "orange";
    default:
      return "gray";
  }
};

const ProductDetailsContent = ({
  product,
}: ProductDetailsContentProps) => {
  const [isShowMoreDescription, setIsShowMoreDescription] = React.useState(false);

  // Get cart data
  const { cart } = useCart();

  // Check if product is in cart
  const cartItem = useMemo(() => {
    return cart?.items.find(item => item.productId === product?.id);
  }, [cart, product?.id]);

  const quantityInCart = cartItem?.quantity || 0;

  const bestDiscount = useMemo(() =>
    product.validApplicableDiscounts.reduce(
      (best, current) => (current.percentage > (best?.percentage || 0) ? current : best),
      null as typeof product.validApplicableDiscounts[0] | null
    ), [product.validApplicableDiscounts]
  );

  const { highestDiscount, discountedPrice, originalPrice, hasDiscount } = useMemo(() => {
    const highestDiscount = bestDiscount?.percentage || 0;
    const discountedPrice = highestDiscount > 0 ? Math.floor(product.price * (1 - highestDiscount / 100)) : product.price;
    const originalPrice = product.price;
    const hasDiscount = product.validApplicableDiscounts.length > 0;
    return { highestDiscount, discountedPrice, originalPrice, hasDiscount };
  }, [bestDiscount, product.price, product.validApplicableDiscounts]);

  const primaryImage = product.multimedia?.images?.[0] || require("@/src/assets/default-image.png");

  const stockStatus: StockStatus = useMemo(() => {
    if (!product || !product.batchStock) return "In Stock";
    if (product.batchStock.usableStock === 0) return "Out of Stock";
    if (product.batchStock.usableStock < product.minimumStockQuantity) return "Low Stock";
    return "In Stock";
  }, [product]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerContent}>
      <ProductDetailsTopBg />

      <ProductDetailsTopBar />
      <ImagesCarousel images={product.multimedia.images} />

      <View style={styles.productNameSection}>
        <Text
          style={styles.productNameText}
          numberOfLines={2}
          ellipsizeMode="tail">
          {product.info.name}
        </Text>
        {/* TODO: Implement rating and review functionality */}
        {/* <Pressable
          style={({ pressed }) => [
            styles.ratingSectionButton,
            pressed && styles.ratingSectionButtonPressed,
          ]}
          onPress={() => {
            router.push({
              pathname: "/product-details/reviews",
              params: { id: product.id },
            });
          }}>
          <Entypo name="star" size={18} color={"#FFBB22"} />
          <Text style={styles.ratingText}>
            5 (12 Reviews)
          </Text>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={theme.colors.text_secondary}
          />
        </Pressable> */}
      </View>

      <View style={styles.topContentContainer}>
        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPriceText}>Rs. {discountedPrice}</Text>
          {
            hasDiscount && (
              <>
                <Text style={styles.oldPriceText}>Rs. {originalPrice}</Text>
                <Text style={styles.discountTag}>
                  {highestDiscount}% off
                </Text>
              </>
            )
          }
          {/* Stock Info */}
          <Text
            style={[
              styles.stockText,
              {
                color: getStockStatusColor(stockStatus),
              },
            ]}>
            {stockStatus}
          </Text>
        </View>
      </View>

      <AddToCartContainer
        productId={product.id}
        productName={product.info.name}
        unitPrice={product.price}
        discountPercentage={highestDiscount}
        appliedDiscountId={bestDiscount?.id}
        appliedDiscountSource={bestDiscount?.source}
        imageUrl={primaryImage}
        discountedPrice={discountedPrice}
        quantityInCart={quantityInCart}
      />

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitleText}>Description</Text>
        <Text style={styles.descriptionText}>
          {isShowMoreDescription ? (
            <>
              {product.info.description}
              <Text
                style={styles.showLessMoreText}
                onPress={() => setIsShowMoreDescription(false)}>
                {" Show Less"}
              </Text>
            </>
          ) : (
            <>
              {product.info.description.length > 100
                ? product.info.description.substring(0, 100) + "... "
                : product.info.description}
              {product.info.description.length > 100 && (
                <Text
                  style={styles.showLessMoreText}
                  onPress={() => setIsShowMoreDescription(true)}>
                  Show More
                </Text>
              )}
            </>
          )}
        </Text>
      </View>

      {/* TODO: Implement bought together products fetching functionality */}
      {/* Show bought together products only when quantity in cart > 0 */}
      {/* {quantityInCart > 0 && boughtTogetherProducts.length > 0 && (
        <ProductsSection
          sectionTitle="Frequently bought together"
          products={boughtTogetherProducts}
          onEndReached={fetchNextBoughtTogetherPage}
          hasNextPage={hasNextBoughtTogetherPage ?? false}
          isFetchingNextPage={isFetchingNextBoughtTogetherPage}
        />
      )} */}

      {/* Show products from the same sub category as Similar Products */}
      {product.info.subCategoryId && (
        <SimilarProductsSection
          productId={product.id}
          subCategoryId={product.info.subCategoryId}
        />
      )}
    </ScrollView>
  );
};

export default ProductDetailsContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerContent: {
    position: "relative",
    paddingBottom: 20,
  },

  productNameSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 20,
  },
  productNameText: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
    flex: 1,
  },
  ratingSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingHorizontal: 10,
  },
  ratingSectionButtonPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 14,
  },
  ratingText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 12,
  },

  topContentContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currentPriceText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  oldPriceText: {
    fontSize: 12,
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
    paddingVertical: 2,
    borderRadius: 10,
    color: "black",
  },
  stockText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    flex: 1,
    textAlign: "right",
  },

  descriptionContainer: {
    paddingHorizontal: 20,
  },
  descriptionTitleText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: theme.colors.text_secondary,
    fontFamily: theme.fonts.regular,
  },
  showLessMoreText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
  },
});
