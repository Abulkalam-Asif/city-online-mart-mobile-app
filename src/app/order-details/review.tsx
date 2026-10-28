import React from "react";
import OrderReviewContent from "@/src/components/order-details/OrderReviewContent";
import { useLocalSearchParams } from "expo-router";

export default function OrderReviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  const orderId = Array.isArray(id) ? id[0] : id;

  return <OrderReviewContent orderId={orderId} />;
}
