import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { OrderStatus } from "@/src/types";

type OrderTab = "all" | OrderStatus;

type OrderTabsProps = {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
};

const OrderTabs = ({ activeTab, onTabChange }: OrderTabsProps) => {
  const tabs: { key: OrderTab; label: string; color: string }[] = [
    { key: "all", label: "All Orders", color: theme.colors.text },
    { key: "pending", label: "Pending", color: theme.colors.pending },
    { key: "confirmed", label: "Confirmed", color: theme.colors.confirmed },
    { key: "shipped", label: "Shipped", color: theme.colors.shipped },
    { key: "delivered", label: "Delivered", color: theme.colors.delivered },
    { key: "cancelled", label: "Cancelled", color: theme.colors.cancelled },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={styles.tabButton}>
            <Text
              style={[
                styles.tabText,
                { color: tab.color },
                activeTab === tab.key && styles.tabTextActive,
              ]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: tab.color },
                ]}
              />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default OrderTabs;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 20,
  },
  tabButton: {
    paddingBottom: 2,
    position: "relative",
  },
  tabText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
  tabTextActive: {
    fontFamily: theme.fonts.semibold,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});
