import { StyleSheet, View } from "react-native";
import React from "react";
import { getResponsiveValue } from "@/src/utils/getResponsiveValue";
import { SkeletonBox, SkeletonPulse } from "@/src/components/common/Skeleton";
import { ProductCardSkeleton } from "@/src/components/tabs/home/HomeSkeletons";

/**
 * Loading placeholders for the Categories tab. Each one copies the size of the real part
 * (CategoriesNav chips, SubCategoriesNav chips, the product grid in categories.tsx), so nothing
 * jumps when the data arrives.
 */

/** Pills in place of the category chips (CategoriesNav). */
export const CategoryChipsSkeleton = () => (
  <SkeletonPulse style={styles.categoryChips}>
    {[96, 150, 130, 84, 110].map((width, index) => (
      <SkeletonBox key={index} width={width} height={30} radius={20} />
    ))}
  </SkeletonPulse>
);

/** Pills in place of the sub-category chips (the sort button next to them stays real). */
export const SubCategoryChipsSkeleton = () => (
  <SkeletonPulse style={styles.subCategoryChips}>
    {[88, 104].map((width, index) => (
      <SkeletonBox key={index} width={width} height={28} radius={8} />
    ))}
  </SkeletonPulse>
);

/**
 * Product grid placeholder: same columns, side padding and card width as the real grid in
 * categories.tsx (keep the two in sync).
 */
export const ProductGridSkeleton = ({ rows = 2 }: { rows?: number }) => {
  const numColumns = getResponsiveValue<number>(2, 3);
  const cardWidth = getResponsiveValue<number>(
    (width) => (width - 30) / 2,
    (width) => (width - 36) / 3,
  );

  return (
    <SkeletonPulse>
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={styles.gridRow}>
          {Array.from({ length: numColumns }, (_, column) => (
            <View
              key={column}
              style={[styles.gridItem, columnPadding(numColumns, column)]}>
              <ProductCardSkeleton cardWidth={cardWidth} />
            </View>
          ))}
        </View>
      ))}
    </SkeletonPulse>
  );
};

const columnPadding = (numColumns: number, column: number) => {
  if (numColumns === 3) {
    if (column === 0) return { paddingLeft: 12, paddingRight: 0 };
    if (column === 1) return { paddingLeft: 6, paddingRight: 6 };
    return { paddingLeft: 0, paddingRight: 12 };
  }
  return column === 0
    ? { paddingLeft: 12, paddingRight: 3 }
    : { paddingLeft: 3, paddingRight: 12 };
};

/** The whole tab below its header while the category list itself loads. */
export const CategoriesScreenSkeleton = () => (
  <View style={styles.screen}>
    <CategoryChipsSkeleton />
    <View style={styles.subCategoryRow}>
      <SkeletonBox width={64} height={33} radius={8} />
      <SubCategoryChipsSkeleton />
    </View>
    <ProductGridSkeleton />
  </View>
);

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#fff",
  },
  categoryChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 4,
    overflow: "hidden",
  },
  subCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 2,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  subCategoryChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  gridRow: {
    flexDirection: "row",
    paddingTop: 8,
  },
  gridItem: {
    flex: 1,
  },
});
