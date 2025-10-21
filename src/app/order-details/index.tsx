import React from "react";
import OrderDetailsContent from "@/src/components/order-details/OrderDetailsContent";
import { useLocalSearchParams } from "expo-router";

export default function OrderDetailsScreen() {
  const { id, status } = useLocalSearchParams<{
    id: string;
    status?: string;
  }>();

  return (
    <OrderDetailsContent
      orderId={id}
      status={
        (status as "confirmed" | "completed" | "cancelled") || "confirmed"
      }
    />
  );
}
