import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { useRatingSummary } from "@/src/hooks/useReviews";

type ProductRatingRowProps = {
  productId: string;
};

/**
 * "4.5 - 12 reviews" under the product name; opens the reviews list.
 * The numbers come from a Firestore aggregate query, so no review is downloaded here.
 * Nothing is shown while loading or when the request fails: the rating is not essential.
 */
const ProductRatingRow = ({ productId }: ProductRatingRowProps) => {
  const { data } = useRatingSummary(productId);

  // Keeps the space while the numbers load, so the page below does not jump
  if (!data) return <View style={styles.placeholder} />;

  if (data.count === 0) {
    return (
      <View style={styles.row}>
        <Ionicons name="star-outline" size={18} color={theme.colors.placeholder} />
        <Text style={styles.mutedText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() =>
        router.push({ pathname: "/product-details/reviews", params: { id: productId } })
      }>
      <Ionicons name="star" size={18} color="#FFBB22" />
      <Text style={styles.ratingText}>{data.average.toFixed(1)}</Text>
      <Text style={styles.mutedText}>
        - {data.count} {data.count === 1 ? "review" : "reviews"}
      </Text>
      <FontAwesome6 name="chevron-right" size={12} color={theme.colors.text_secondary} />
    </Pressable>
  );
};

export default ProductRatingRow;

const styles = StyleSheet.create({
  placeholder: {
    height: 28,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    height: 28,
    marginTop: 4,
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  rowPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 14,
  },
  ratingText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
  },
  mutedText: {
    color: theme.colors.text_secondary,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
  },
});
