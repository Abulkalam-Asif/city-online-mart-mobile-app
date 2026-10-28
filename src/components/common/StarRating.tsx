import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const STAR_COLOR = "#FFBB22";

type StarRatingProps = {
  /** 0 to 5; 0 shows five empty stars. */
  rating: number;
  /** When given, the stars can be tapped to pick a rating. */
  onChange?: (rating: number) => void;
  size?: number;
};

/**
 * Five stars: a read-only display, or a tap-to-rate input when onChange is passed.
 */
const StarRating = ({ rating, onChange, size = 18 }: StarRatingProps) => {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((value) => {
        const star = (
          <Ionicons
            name={value <= rating ? "star" : "star-outline"}
            size={size}
            color={STAR_COLOR}
          />
        );
        if (!onChange) return <View key={value}>{star}</View>;
        return (
          <Pressable
            key={value}
            onPress={() => onChange(value)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${value} star${value > 1 ? "s" : ""}`}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
};

export default StarRating;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
