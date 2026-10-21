import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/src/constants/theme';
import OrderListItem from './OrderListItem';

export interface DisplayItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  originalPrice?: number;
  discountPercentage?: number;
  /** Order Details only: "Refunded" or "2 of 3 refunded" (active refunds). */
  refundLabel?: string;
}

interface OrderItemsListProps {
  items: DisplayItem[];
  isCaptureView?: boolean;
}

// Items shown before "View all": long carts stay short without a scroll box inside the page.
const COLLAPSED_ITEM_COUNT = 3;
const ANIMATION = { duration: 280, easing: Easing.out(Easing.cubic) };

export default function OrderItemsList({ items, isCaptureView = false }: OrderItemsListProps) {
  const [expanded, setExpanded] = useState(false);
  // Heights of the always-visible rows and of the extra rows, measured once they are laid out.
  const [firstHeight, setFirstHeight] = useState(0);
  const [restHeight, setRestHeight] = useState(0);
  const height = useSharedValue(-1); // -1 until measured: the card is not clipped before that
  const progress = useSharedValue(0); // 0 collapsed, 1 expanded
  const hasMeasured = useRef(false);

  useEffect(() => {
    if (firstHeight === 0) return;
    const target = expanded ? firstHeight + restHeight : firstHeight;
    if (!hasMeasured.current) {
      hasMeasured.current = true;
      height.value = target;
      progress.value = expanded ? 1 : 0;
      return;
    }
    height.value = withTiming(target, ANIMATION);
    progress.value = withTiming(expanded ? 1 : 0, ANIMATION);
  }, [expanded, firstHeight, restHeight, height, progress]);

  const clipStyle = useAnimatedStyle(() => (height.value < 0 ? {} : { height: height.value }));
  const restStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  if (!items || items.length === 0) return null;

  // The receipt capture always shows every item.
  const canCollapse = !isCaptureView && items.length > COLLAPSED_ITEM_COUNT;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Items ({items.length})</Text>
      {canCollapse ? (
        <>
          <Animated.View style={[styles.clip, clipStyle]}>
            <View onLayout={(e) => setFirstHeight(e.nativeEvent.layout.height)}>
              {items.slice(0, COLLAPSED_ITEM_COUNT).map((item) => (
                <OrderListItem item={item} key={item.id} />
              ))}
            </View>
            <Animated.View
              style={restStyle}
              onLayout={(e) => setRestHeight(e.nativeEvent.layout.height)}
            >
              {items.slice(COLLAPSED_ITEM_COUNT).map((item) => (
                <OrderListItem item={item} key={item.id} />
              ))}
            </Animated.View>
          </Animated.View>
          <Pressable
            style={({ pressed }) => [styles.toggleButton, pressed && styles.toggleButtonPressed]}
            onPress={() => setExpanded((value) => !value)}
            accessibilityRole="button"
          >
            <Text style={styles.toggleText}>
              {expanded ? 'Show less' : `View all ${items.length} items`}
            </Text>
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
            </Animated.View>
          </Pressable>
        </>
      ) : (
        items.map((item) => <OrderListItem item={item} key={item.id} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
    // each item row adds 10 of its own padding, so the bottom is 6 + 10 = 16 like the top
    paddingTop: 16,
    paddingBottom: 6,
    marginTop: 16,
  },
  title: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginBottom: 6,
    paddingHorizontal: 16
  },
  clip: {
    overflow: 'hidden',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
    marginHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  toggleButtonPressed: {
    backgroundColor: theme.colors.primary_light,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
});
