import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { theme } from "@/src/constants/theme";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import EmptyState from "@/src/components/common/EmptyState";
import StarRating from "@/src/components/common/StarRating";
import ReviewCard from "@/src/components/product-details/reviews/ReviewCard";
import { useProductReviews, useRatingSummary } from "@/src/hooks/useReviews";

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const productId = Array.isArray(id) ? id[0] : id;

  const summary = useRatingSummary(productId);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductReviews(productId);

  const reviews = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <EmptyState
          tone="error"
          title="Couldn't load reviews"
          message="Check your connection and try again."
          actionText="Retry"
          onAction={() => refetch()}
        />
      );
    }

    return (
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        data={reviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
        keyExtractor={(item) => item.customerId}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          summary.data && summary.data.count > 0 ? (
            <View style={styles.summaryCard}>
              <Text style={styles.averageText}>{summary.data.average.toFixed(1)}</Text>
              <StarRating rating={Math.round(summary.data.average)} size={20} />
              <Text style={styles.countText}>
                {summary.data.count} {summary.data.count === 1 ? "review" : "reviews"}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="star-outline"
            title="No reviews yet"
            message="Reviews from customers who received this product appear here."
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} color={theme.colors.primary} />
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => {
              refetch();
              summary.refetch();
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    );
  };

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="Reviews" />
      {renderBody()}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  averageText: {
    fontFamily: theme.fonts.bold,
    fontSize: 36,
    color: theme.colors.text,
  },
  countText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.text_secondary,
  },
  footerLoader: {
    paddingVertical: 12,
  },
});
