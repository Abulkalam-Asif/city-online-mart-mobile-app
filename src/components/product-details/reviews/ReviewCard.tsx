import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { theme } from "@/src/constants/theme";
import { Review } from "@/src/types/review.types";
import { convertTimestamp } from "@/src/utils/firestoreUtils";
import StarRating from "@/src/components/common/StarRating";

type ReviewCardProps = {
  review: Review;
};

const ReviewCard = ({ review }: ReviewCardProps) => {
  const name = review.customerName || "Customer";

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        {/* Customers have no profile picture, so the first letter of the name stands in */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.nameSection}>
          <Text style={styles.customerNameText} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.reviewDateText}>
            {formatDistanceToNow(convertTimestamp(review.createdAt), { addSuffix: true })}
          </Text>
        </View>
        <StarRating rating={review.rating} size={16} />
      </View>
      {review.text ? <Text style={styles.reviewText}>{review.text}</Text> : null}
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background_3,
    padding: 16,
    borderRadius: 8,
    gap: 10,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary_light,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  nameSection: {
    flex: 1,
  },
  customerNameText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.text,
  },
  reviewDateText: {
    color: theme.colors.text_secondary,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
  },
  reviewText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
  },
});
