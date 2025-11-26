import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { theme } from "@/src/constants/theme";
import { Product } from "@/src/types";
import AddToCartContainer from "./AddToCartContainer";
import ImagesCarousel from "./ImagesCarousel";
import ProductDetailsTopBg from "./ProductDetailsTopBg";
import ProductDetailsTopBar from "./ProductDetailsTopBar";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import ProductsSection from "./ProductsSection";
import { router } from "expo-router";
import { useInfiniteProductsByIds } from "@/src/hooks/useProducts";
import { useCart } from "@/src/hooks/useCart";

type ProductDetailsContentProps = {
  product: Product;
  isLoading: boolean;
};

const ProductDetailsContent = ({
  product,
  isLoading,
}: ProductDetailsContentProps) => {
  const [isShowMoreDescription, setIsShowMoreDescription] = React.useState(false);

  // Get cart data
  const { data: cart } = useCart();

  // Check if product is in cart
  const cartItem = useMemo(() => {
    return cart?.items.find(item => item.productId === product?.id);
  }, [cart, product?.id]);

  const quantityInCart = cartItem?.quantity || 0;

  // Fetch similar products (always enabled)
  const {
    data: similarProductsData,
    fetchNextPage: fetchNextSimilarPage,
    hasNextPage: hasNextSimilarPage,
    isFetchingNextPage: isFetchingNextSimilarPage,
  } = useInfiniteProductsByIds(
    product?.similarProductIds || [],
    "similar",
    true
  );

  // Fetch bought together products (only when quantity > 0)
  const {
    data: boughtTogetherProductsData,
    fetchNextPage: fetchNextBoughtTogetherPage,
    hasNextPage: hasNextBoughtTogetherPage,
    isFetchingNextPage: isFetchingNextBoughtTogetherPage,
  } = useInfiniteProductsByIds(
    product?.boughtTogetherProductIds || [],
    "bought-together",
    quantityInCart > 0
  );

  // Flatten infinite query pages
  const similarProducts = useMemo(() => {
    return similarProductsData?.pages.flatMap((page) => page.products) || [];
  }, [similarProductsData]);

  const boughtTogetherProducts = useMemo(() => {
    return (
      boughtTogetherProductsData?.pages.flatMap((page) => page.products) || []
    );
  }, [boughtTogetherProductsData]);

  return (
    <>
      {isLoading ? (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading product...</Text>
          </View>
        </ScrollView>
      ) : !product ? (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Product not found</Text>
          </View>
        </ScrollView>
      ) : (
        <>
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
                {/* Product name here Product name here Product name here */}
                {product.info.name}
              </Text>
              <Pressable
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
                {/* <Text style={styles.ratingText}>
                  {product.ApprovedRatingSum} ({product.ApprovedTotalReviews}{" "}
                  Review)
                </Text> */}
                <FontAwesome6
                  name="chevron-right"
                  size={16}
                  color={theme.colors.text_secondary}
                />
              </Pressable>
            </View>

            <View style={styles.topContentContainer}>
              {/* Price Section */}
              <View style={styles.priceSection}>
                {/* <Text style={styles.currentPriceText}>Rs. {product.price}</Text>
                <Text style={styles.oldPriceText}>Rs. {product.OldPrice}</Text>
                <Text style={styles.discountTag}>
                  Rs.{" "}
                  {product.OldPrice && product.OldPrice - product.Price > 0
                    ? product.OldPrice - product.Price
                    : 0}{" "}
                  off
                </Text> */}
                {/* Stock Info */}
                {/* {product.StockInfo && (
                  <Text
                    style={[
                      styles.stockText,
                      {
                        color: product.StockInfo.InStock ? "#6E37B2" : "red",
                      },
                    ]}>
                    {product.StockInfo.StockAvailability}
                  </Text>
                )} */}
              </View>
            </View>

            <AddToCartContainer
              productId={product.id}
              productName={product.info.name}
              quantityInCart={quantityInCart}
              price={product.price}
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

            {/* Show bought together products only when quantity in cart > 0 */}
            {quantityInCart > 0 && boughtTogetherProducts.length > 0 && (
              <ProductsSection
                sectionTitle="Frequently bought together"
                products={boughtTogetherProducts}
                onEndReached={fetchNextBoughtTogetherPage}
                hasNextPage={hasNextBoughtTogetherPage ?? false}
                isFetchingNextPage={isFetchingNextBoughtTogetherPage}
              />
            )}

            {/* Show similar products if available */}
            {similarProducts.length > 0 && (
              <ProductsSection
                sectionTitle="Similar products"
                products={similarProducts}
                onEndReached={fetchNextSimilarPage}
                hasNextPage={hasNextSimilarPage ?? false}
                isFetchingNextPage={isFetchingNextSimilarPage}
              />
            )}
          </ScrollView>
        </>
      )}
    </>
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

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: theme.fonts.medium,
  },
});
