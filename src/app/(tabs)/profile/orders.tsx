import { ScrollView, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import OrderTabs from "@/src/components/tabs/profile/orders/OrderTabs";
import OrderItem from "@/src/components/tabs/profile/orders/OrderItem";
import { tempOrders } from "@/temp/orders/tempOrders";

type OrderTab = "all" | "completed" | "in-process" | "cancelled";

// Temporary order data
const OrdersScreen = () => {
  const [activeTab, setActiveTab] = useState<OrderTab>("all");

  const filteredOrders = tempOrders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  return (
    <View style={styles.container}>
      <GeneralTopBar text="Orders" />
      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.containerContent}>
        {filteredOrders.map((order) => (
          <OrderItem
            key={order.id}
            orderId={order.id}
            date={order.date}
            itemCount={order.itemCount}
            price={order.price}
            status={order.status}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  containerContent: {
    paddingBottom: 100,
  },
});
