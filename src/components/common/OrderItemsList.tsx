import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
}

interface OrderItemsListProps {
  items: DisplayItem[];
  isCaptureView?: boolean;
}

export default function OrderItemsList({ items, isCaptureView = false }: OrderItemsListProps) {
  if (!items || items.length === 0) return null;

  const content = items.map((item) => (
    <OrderListItem item={item} key={item.id} />
  ));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Items ({items.length})</Text>
      {isCaptureView ? (
        <View style={styles.captureListContainer}>
          {content}
        </View>
      ) : (
        <ScrollView style={styles.listContainer} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
          {content}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginBottom: 12,
    paddingHorizontal: 16
  },
  listContainer: {
    maxHeight: 220,
  },
  captureListContainer: {
    // No max height so it grows fully for the capture
  },
});
