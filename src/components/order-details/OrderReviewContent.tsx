import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import ScreenFooter from "@/src/components/general/ScreenFooter";
import PrimaryButton from "@/src/components/general/PrimaryButton";
import EmptyState from "@/src/components/common/EmptyState";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import StarRating from "@/src/components/common/StarRating";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGetOrderById } from "@/src/hooks/useOrders";
import { useOrderReviewItems, useSaveReviews } from "@/src/hooks/useReviews";
import { REVIEW_TEXT_MAX_LENGTH } from "@/src/types/review.types";

type Draft = { rating: number; text: string };

type OrderReviewContentProps = {
  orderId?: string;
};

/**
 * Rating screen of a delivered order: one card per item with tap-stars and an optional text.
 * Items the customer already reviewed come prefilled, and saving again edits that review.
 */
const OrderReviewContent = ({ orderId }: OrderReviewContentProps) => {
  const { user } = useAuth();
  const { data: order, isLoading: orderLoading, error: orderError, refetch: refetchOrder } =
    useGetOrderById(orderId);
  const { items, reviews, isLoading, isError, refetch } = useOrderReviewItems(order, user?.uid);
  const saveReviews = useSaveReviews();

  // Only what the customer changed on this screen; everything else shows the saved review.
  const [edits, setEdits] = useState<Record<string, Partial<Draft>>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const getDraft = (productId: string): Draft => ({
    rating: edits[productId]?.rating ?? reviews[productId]?.rating ?? 0,
    text: edits[productId]?.text ?? reviews[productId]?.text ?? "",
  });

  const setEdit = (productId: string, change: Partial<Draft>) =>
    setEdits((prev) => ({ ...prev, [productId]: { ...prev[productId], ...change } }));

  // Rated items that are new or differ from the saved review. Unchanged ones are not rewritten.
  const changedItems = items.filter((item) => {
    const draft = getDraft(item.productId);
    const saved = reviews[item.productId];
    if (draft.rating === 0) return false;
    return (
      !saved ||
      saved.rating !== draft.rating ||
      (saved.text ?? "") !== draft.text.trim()
    );
  });
  const hasSavedReview = items.some((item) => reviews[item.productId]);

  const handleSubmit = () => {
    if (!order || !user?.uid || changedItems.length === 0) return;
    setErrorMessage("");
    saveReviews.mutate(
      changedItems.map((item) => ({
        productId: item.productId,
        customerId: user.uid,
        customerName: user.displayName || "",
        orderId: order.id,
        rating: getDraft(item.productId).rating,
        text: getDraft(item.productId).text,
      })),
      {
        onSuccess: () => setShowSuccess(true),
        onError: (error) =>
          setErrorMessage(
            error instanceof Error && error.message
              ? error.message
              : "Your review could not be saved. Please try again.",
          ),
      },
    );
  };

  const renderBody = () => {
    if (orderLoading || isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (!order || orderError || isError) {
      return (
        <EmptyState
          tone="error"
          title="Couldn't load your order"
          message="Check your connection and try again."
          actionText="Retry"
          onAction={() => {
            refetchOrder();
            refetch();
          }}
        />
      );
    }

    if (order.status !== "delivered") {
      return (
        <EmptyState
          icon="time-outline"
          title="Not delivered yet"
          message="You can review the items once your order is delivered."
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          icon="star-outline"
          title="Nothing to review"
          message="Refunded items, and products that no longer take reviews, are left out."
        />
      );
    }

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.introText}>
          Tap the stars to rate each item. Adding a few words is optional.
        </Text>
        {items.map((item) => {
          const draft = getDraft(item.productId);
          return (
            <View key={item.productId} style={styles.card}>
              <View style={styles.itemRow}>
                <Image
                  source={item.imageUrl || require("@/src/assets/default-image.png")}
                  style={styles.itemImage}
                  contentFit="contain"
                />
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
              </View>
              <StarRating
                rating={draft.rating}
                size={34}
                onChange={(rating) => setEdit(item.productId, { rating })}
              />
              <TextInput
                style={styles.input}
                value={draft.text}
                onChangeText={(text) => setEdit(item.productId, { text })}
                placeholder="Write a review (optional)"
                placeholderTextColor={theme.colors.placeholder}
                multiline
                maxLength={REVIEW_TEXT_MAX_LENGTH}
                textAlignVertical="top"
              />
              <Text style={styles.counterText}>
                {draft.text.length}/{REVIEW_TEXT_MAX_LENGTH}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const showFooter =
    !!order && order.status === "delivered" && !isLoading && !isError && items.length > 0;

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="Rate your items" />
      {renderBody()}

      {showFooter && (
        <ScreenFooter>
          <PrimaryButton
            label={
              saveReviews.isPending
                ? "Saving..."
                : hasSavedReview
                  ? "Update Review"
                  : "Submit Review"
            }
            onPress={handleSubmit}
            disabled={changedItems.length === 0 || saveReviews.isPending}
          />
        </ScreenFooter>
      )}

      <ConfirmationModal
        visible={showSuccess}
        title="Thank you!"
        message="Your review has been saved."
        confirmText="OK"
        cancelText="Close"
        iconName="checkmark-circle"
        iconColor={theme.colors.success}
        onConfirm={() => router.back()}
        onCancel={() => router.back()}
      />

      {errorMessage ? (
        <ErrorBanner
          title="Unable to Save"
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      ) : null}
    </View>
  );
};

export default OrderReviewContent;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  introText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
  },
  card: {
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  input: {
    minHeight: 72,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  counterText: {
    alignSelf: "flex-end",
    fontSize: 11,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
  },
});
