import { theme } from "@/src/constants/theme";
import { useBestPriceProducts } from "@/src/hooks/useBestPriceProducts";
import { IProduct } from "@/src/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const BestPricesSection = () => {
  const { data: bestPricesData, isLoading, error } = useBestPriceProducts(6);

  const handleCardPress = (originalProduct: any) => {
    router.push({
      pathname: "/product-details",
      params: { id: originalProduct.id }, // Use the original Firestore document ID
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitleText}>Our Best Prices</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {[...Array(6)].map((_, index) => (
            <View key={index} style={[styles.card, styles.loadingCard]} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error || !bestPricesData || bestPricesData.length === 0) {
    return null; // Don't show section if no data or error
  }

  // Transform ProductWithDiscount to IProduct format
  const transformedProducts: IProduct[] = bestPricesData.map((product) => ({
    Id: product.id, // Use the actual Firestore document ID
    Name: product.info.name,
    MainImageUrl: product.multimedia.images[0] || require("@/src/assets/default-image.png"),
    Price: product.price - product.savings, // Discounted price
    OldPrice: product.price, // Original price
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitleText}>Our Best Prices</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {transformedProducts.map((product, index) => {
          const originalProduct = bestPricesData[index]; // Get the original product data
          const discountPercentage = product.OldPrice
            ? Math.round(((product.OldPrice - product.Price) / product.OldPrice) * 100)
            : 0;
          const savings = product.OldPrice ? product.OldPrice - product.Price : 0;

          return (
            <Pressable
              onPress={() => handleCardPress(originalProduct)}
              key={product.Id}
              style={styles.card}>
              <Image
                source={product.MainImageUrl}
                style={styles.image}
                contentFit="contain"
                placeholder={require("@/src/assets/default-image.png")}
              />
              <Text style={styles.discountPercentageText}>
                {discountPercentage}% off
              </Text>
              <Text style={styles.discountText}>
                Save Rs. {Math.round(savings)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default BestPricesSection;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  sectionTitleText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    paddingLeft: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    gap: 20,
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: theme.colors.background_2,
    width: 150,
    paddingVertical: 28,
    flexDirection: "column",
    gap: 12,
    position: "relative",
    overflow: "hidden",
  },
  discountPercentageText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    position: "absolute",
    top: 12,
    left: -25,
    transform: [{ rotate: "-0.785398rad" }], // -45 degrees in radians
    backgroundColor: theme.colors.primary,
    color: "#fff",
    paddingVertical: 2,
    width: 100,
    textAlign: "center",
  },
  image: {
    width: 100,
    height: 100,
  },
  discountText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
  },
  loadingCard: {
    backgroundColor: theme.colors.background_2,
    opacity: 0.5,
  },
});
