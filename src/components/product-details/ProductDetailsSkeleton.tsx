import { StyleSheet, View, useWindowDimensions } from "react-native";
import React from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import IconButton from "@/src/components/general/IconButton";
import { SkeletonBox, SkeletonPulse } from "@/src/components/common/Skeleton";
import { ProductCardSkeleton } from "@/src/components/tabs/home/HomeSkeletons";
import ProductDetailsTopBg from "./ProductDetailsTopBg";

/**
 * Loading placeholder for the product page. Same order and sizes as the real page (picture,
 * name, price row, add to cart, similar products), so nothing jumps when the product arrives.
 * The back arrow is real, so the customer can leave while it loads.
 */
const ProductDetailsSkeleton = () => {
  const { width: screenWidth } = useWindowDimensions();
  // same card width as SimilarProductsSection
  const cardWidth = Math.max(150, Math.min(220, screenWidth * 0.4));

  return (
    <View style={styles.container}>
      <ProductDetailsTopBg />
      <View style={styles.topBar}>
        <IconButton
          icon={<FontAwesome6 name="chevron-left" size={24} color={"#000"} />}
          onPress={() => router.back()}
        />
      </View>

      <SkeletonPulse>
        <View style={styles.imageWrap}>
          <SkeletonBox width={250} height={250} radius={12} />
        </View>

        <View style={styles.nameSection}>
          <SkeletonBox width="70%" height={18} radius={6} />
        </View>

        <View style={styles.priceRow}>
          <SkeletonBox width={90} height={18} radius={6} />
          <SkeletonBox width={50} height={14} radius={6} />
          <SkeletonBox width={56} height={20} radius={4} />
        </View>

        <View style={styles.buttonWrap}>
          <SkeletonBox width="100%" height={44} radius={30} />
        </View>

        <View style={styles.similarTitle}>
          <SkeletonBox width={140} height={16} radius={6} />
        </View>
        <View style={styles.similarRow}>
          {[0, 1].map((i) => (
            <ProductCardSkeleton key={i} cardWidth={cardWidth} />
          ))}
        </View>
      </SkeletonPulse>
    </View>
  );
};

export default ProductDetailsSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // the real picture block is 250 tall and the photo sits in its middle
  imageWrap: {
    height: 250,
    alignItems: "center",
  },
  nameSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  buttonWrap: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  similarTitle: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  similarRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
});
