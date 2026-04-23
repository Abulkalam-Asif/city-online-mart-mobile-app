import {
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import OrderTabs from "@/src/components/tabs/profile/orders/OrderTabs";
import OrderItem from "@/src/components/tabs/profile/orders/OrderItem";
import { theme } from "@/src/constants/theme";
import { OrderStatus } from "@/src/types";
import Loading from "@/src/components/common/Loading";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { useGetInfiniteCustomerOrders } from "@/src/hooks/useOrders";
import { CONSTANTS } from "@/src/constants/constants";
import { convertTimestamp } from "@/src/utils/firestoreUtils";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import { auth } from "@/firebaseConfig";

type OrderTab = "all" | OrderStatus;

const OrdersScreen = () => {
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const { isLoading: authLoading } = useAuthUser();
  const firebaseUid = auth.currentUser?.uid;
  const isAuthReady = !!firebaseUid;

  const ordersQuery = useGetInfiniteCustomerOrders(
    firebaseUid || "",
    CONSTANTS.limits.ordersPerPage,
  );

  // Format date from Date object to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const orders = useMemo(
    () => ordersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [ordersQuery.data],
  );

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await ordersQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle loading state
  if (authLoading || !isAuthReady || ordersQuery.isLoading) {
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
  if (ordersQuery.error) {
    return (
      <ErrorBanner
        title="Unable to Load"
        message="Failed to load orders. Please try again."
        onRetry={() => ordersQuery.refetch()}
      />
    );
  }

  const renderOrderItem = ({ item }: { item: typeof filteredOrders[number] }) => (
    <OrderItem
      orderId={item.id}
      date={formatDate(convertTimestamp(item.createdAt))}
      itemCount={item.items.reduce(
        (total, orderItem) => total + orderItem.quantity,
        0,
      )}
      price={item.total}
      status={item.status}
    />
  );

  const listFooter = ordersQuery.isFetchingNextPage ? (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <GeneralTopBar text="Orders" />
      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.containerContent}
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "all"
                ? "No orders found"
                : `No ${activeTab} orders`}
            </Text>
          </View>
        }
        ListFooterComponent={listFooter}
        onEndReached={() => {
          if (ordersQuery.hasNextPage && !ordersQuery.isFetchingNextPage) {
            ordersQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[
              theme.colors.primary,
              theme.colors.secondary,
              theme.colors.error,
            ]}
            tintColor={theme.colors.primary}
          />
        }
      />
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
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
