import React from "react";
import OrderDetailsContent from "@/src/components/order-details/OrderDetailsContent";
import { useLocalSearchParams } from "expo-router";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id?: string | string[];
    status?: string;
  }>();

  const orderId = Array.isArray(id) ? id[0] : id;

  return <OrderDetailsContent orderId={orderId} />;
}
