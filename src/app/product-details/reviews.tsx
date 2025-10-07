import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import ReviewsTopBar from "@/src/components/product-details/reviews/ReviewsTopBar";
import { tempReviews } from "@/temp/home/product-details/tempReviews";
import ReviewCard from "@/src/components/product-details/reviews/ReviewCard";

export default function ReviewsScreen() {
  // const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.mainContainer}>
      <ReviewsTopBar />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        data={tempReviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
        keyExtractor={(item) => item.Id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  containerContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
});
