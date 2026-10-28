import { Dimensions, StyleSheet, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { CONSTANTS } from "@/src/constants/constants";
import { getResponsiveValue } from "@/src/utils/getResponsiveValue";
import { getCarouselCardWidth } from "@/src/utils/carouselCardWidth";
import { SkeletonBox, SkeletonPulse } from "@/src/components/common/Skeleton";

/**
 * Loading placeholders for the home screen. Each one copies the size of the real section
 * (BannersCarousel, CategoriesSection, ProductsSection / ProductCard), so nothing jumps when
 * the data arrives.
 */

const width = Dimensions.get("window").width;

/**
 * Banner card and the row of pagination dots under it, so the sections below do not move when the
 * real carousel arrives. The card straddles the green header and the white page, so it uses the
 * same solid grey as the other skeletons (a translucent white vanished on the white part).
 */
export const BannersSkeleton = () => {
  const cardWidth = width * 0.9;
  return (
    <SkeletonPulse style={styles.bannersContainer}>
      <View style={styles.bannerCard}>
        <SkeletonBox
          width={cardWidth}
          height={cardWidth / CONSTANTS.homepageBannerRatio}
          radius={width * 0.025}
        />
      </View>
      <View style={styles.bannerDots}>
        <SkeletonBox width={30} height={10} radius={5} />
        <SkeletonBox width={10} height={10} radius={5} />
        <SkeletonBox width={10} height={10} radius={5} />
      </View>
    </SkeletonPulse>
  );
};

/** Title row plus two rows of round-cornered category tiles, like CategoriesSection. */
export const CategoriesSkeleton = () => {
  const columnWidth = getResponsiveValue<number>(
    (w) => (w - 80) / 3.25,
    (w) => (w - 112) / 6,
  );
  const rowGap = getResponsiveValue<number>(4, 16);

  return (
    <SkeletonPulse style={styles.categoriesContainer}>
      <View style={styles.sectionHeader}>
        <SkeletonBox width={110} height={18} radius={6} />
        <SkeletonBox width={48} height={12} radius={6} />
      </View>
      <View style={styles.categoriesRow}>
        {[0, 1, 2, 3, 4].map((column) => (
          <View key={column} style={{ width: columnWidth, gap: rowGap }}>
            {[0, 1].map((row) => (
              <View key={row} style={styles.categoryCard}>
                <SkeletonBox width={columnWidth} height={columnWidth} radius={16} />
                <SkeletonBox width={columnWidth * 0.65} height={14} radius={5} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </SkeletonPulse>
  );
};

/** One product card: image, two name lines, price, "Add to cart" pill. */
export const ProductCardSkeleton = ({ cardWidth }: { cardWidth: number }) => (
  <View style={[styles.productCard, { width: cardWidth }]}>
    <SkeletonBox width="100%" height={150} radius={14} />
    <View style={styles.productTextLines}>
      <SkeletonBox width="90%" height={10} radius={5} />
      <SkeletonBox width="60%" height={10} radius={5} />
    </View>
    <SkeletonBox width="45%" height={14} radius={6} style={styles.productPrice} />
    <SkeletonBox width="100%" height={28} radius={20} style={styles.productButton} />
  </View>
);

/** The row of product cards inside a ProductsSection band (header and band come from the real section). */
export const ProductsRowSkeleton = ({ cardWidth }: { cardWidth: number }) => (
  <SkeletonPulse style={styles.productsRow}>
    {[0, 1, 2].map((i) => (
      <ProductCardSkeleton key={i} cardWidth={cardWidth} />
    ))}
  </SkeletonPulse>
);

/** Box in place of a section's title and its "View All" link while its products load. */
export const ProductsHeaderSkeleton = () => (
  <SkeletonPulse style={styles.productsHeader}>
    <SkeletonBox width={150} height={18} radius={6} />
    <SkeletonBox width={48} height={12} radius={6} />
  </SkeletonPulse>
);

/** A whole ProductsSection (title row and coloured band), shown while the list of special categories loads. */
export const ProductsSectionSkeleton = ({ colorIndex }: { colorIndex: number }) => {
  const cardWidth = getCarouselCardWidth(width);
  return (
    <View style={styles.productsSection}>
      <ProductsHeaderSkeleton />
      <View
        style={[
          styles.productsBand,
          {
            backgroundColor:
              theme.extra_light_colors[colorIndex % theme.extra_light_colors.length],
          },
        ]}>
        <ProductsRowSkeleton cardWidth={cardWidth} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannersContainer: {
    marginBottom: 20,
  },
  bannerCard: {
    alignItems: "center",
  },
  bannerDots: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 26,
    gap: 8,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 20, // the real title's line height
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  categoryCard: {
    alignItems: "center",
    gap: 8,
    height: getResponsiveValue<number>(125, 150),
  },
  productCard: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.background_3,
  },
  productTextLines: {
    marginTop: 8,
    gap: 6,
    minHeight: 28,
  },
  productPrice: {
    marginTop: 8,
  },
  productButton: {
    marginTop: 8,
  },
  productsRow: {
    flexDirection: "row",
    gap: 12,
  },
  productsSection: {
    paddingVertical: 10,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 24, // about the real title's line height (16px Poppins)
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  productsBand: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    overflow: "hidden",
  },
});
