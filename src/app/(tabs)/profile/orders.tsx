import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import OrderTabs from "@/src/components/tabs/profile/orders/OrderTabs";
import OrderItem from "@/src/components/tabs/profile/orders/OrderItem";
// import { useGetCustomerOrders } from "@/src/hooks/useOrders";
import { theme } from "@/src/constants/theme";
import { OrderStatus } from "@/src/types";
import Loading from "@/src/components/common/Loading";

type OrderTab = "all" | OrderStatus;

// Mock customer ID - in real app, get from auth context
const mockCustomerId = "customer123";

const OrdersScreen = () => {
  const [activeTab, setActiveTab] = useState<OrderTab>("all");

  // Fetch real orders from database
  const {
    data: orders,
    isLoading,
    error,
  } = {
    data: [],
    isLoading: false,
    error: null,
  };

  // Format date from Date object to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Filter orders based on active tab
  const filteredOrders =
    orders?.filter((order) => {
      if (activeTab === "all") return true;
      // return order.status === activeTab;
      return true;
    }) || [];

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <GeneralTopBar text="Orders" />
        <View style={styles.loadingContainer}>
          <Loading text="Loading orders..." />
        </View>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.container}>
        <GeneralTopBar text="Orders" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load orders</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GeneralTopBar text="Orders" />
      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.containerContent}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "all"
                ? "No orders found"
                : `No ${activeTab} orders`}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            // <OrderItem
            //   key={order.id}
            //   orderId={order.id}
            //   date={formatDate(order.createdAt)}
            //   itemCount={order.items.reduce(
            //     (total, item) => total + item.quantity,
            //     0
            //   )}
            //   price={order.total}
            //   status={order.status}
            // />
            <></>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: "red",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
});
