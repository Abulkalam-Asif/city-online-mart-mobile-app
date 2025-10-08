import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "@/src/constants/theme";
import { IProductDetails } from "@/src/types";
import AddToCartContainer from "./AddToCartContainer";
import ImagesCarousel from "./ImagesCarousel";
import ProductDetailsTopBg from "./ProductDetailsTopBg";
import ProductDetailsTopBar from "./ProductDetailsTopBar";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import ProductsSection from "./ProductsSection";
import { router } from "expo-router";

type ProductContentProps = {
  product: IProductDetails | undefined;
  isLoading: boolean;
};

const ProductContent = ({ product, isLoading }: ProductContentProps) => {
  const [quantityInCart, setQuantityInCart] = useState(0);
  const [isShowMoreDescription, setIsShowMoreDescription] = useState(false);
  const [productsDisplayType, setProductsDisplayType] = useState<
    "similar" | "bought_together"
  >("similar");

  useEffect(() => {
    if (quantityInCart === 0) {
      setProductsDisplayType("similar");
    } else {
      setProductsDisplayType("bought_together");
    }
  }, [quantityInCart]);

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
            <ImagesCarousel images={product.Images} />

            <View style={styles.productNameSection}>
              <Text
                style={styles.productNameText}
                numberOfLines={2}
                ellipsizeMode="tail">
                {/* Product name here Product name here Product name here */}
                {product.Name}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.ratingSectionButton,
                  pressed && styles.ratingSectionButtonPressed,
                ]}
                onPress={() => {
                  router.push({
                    pathname: "/product-details/reviews",
                    params: { id: String(product.Id) },
                  });
                }}>
                <Entypo name="star" size={18} color={"#FFBB22"} />
                <Text style={styles.ratingText}>
                  {product.ApprovedRatingSum} ({product.ApprovedTotalReviews}{" "}
                  Review)
                </Text>
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
                <Text style={styles.currentPriceText}>Rs. {product.Price}</Text>
                <Text style={styles.oldPriceText}>Rs. {product.OldPrice}</Text>
                <Text style={styles.discountTag}>
                  Rs.{" "}
                  {product.OldPrice && product.OldPrice - product.Price > 0
                    ? product.OldPrice - product.Price
                    : 0}{" "}
                  off
                </Text>
                {/* Stock Info */}
                {product.StockInfo && (
                  <Text
                    style={[
                      styles.stockText,
                      {
                        color: product.StockInfo.InStock ? "#6E37B2" : "red",
                      },
                    ]}>
                    {product.StockInfo.StockAvailability}
                  </Text>
                )}
              </View>
            </View>

            <AddToCartContainer
              quantityInCart={quantityInCart}
              setQuantityInCart={setQuantityInCart}
              price={product.Price}
            />

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitleText}>Description</Text>
              <Text style={styles.descriptionText}>
                {isShowMoreDescription ? (
                  <>
                    {product.FullDescription}
                    <Text
                      style={styles.showLessMoreText}
                      onPress={() => setIsShowMoreDescription(false)}>
                      {" Show Less"}
                    </Text>
                  </>
                ) : (
                  <>
                    {product.FullDescription.length > 100
                      ? product.FullDescription.substring(0, 100) + "... "
                      : product.FullDescription}
                    {product.FullDescription.length > 100 && (
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

            <ProductsSection
              sectionTitle={
                productsDisplayType === "similar"
                  ? "Similar products"
                  : "Frequently bought together"
              }
              products={
                productsDisplayType === "similar"
                  ? product.RelatedProducts
                  : product.CrossSellProducts
              }
            />
          </ScrollView>
        </>
      )}
    </>
  );
};

export default ProductContent;

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
    lineHeight: 24,
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
    backgroundColor: "#FBBE36",
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
