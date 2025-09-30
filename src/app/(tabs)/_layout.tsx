import { Tabs } from "expo-router";
import React from "react";
import CustomTabBar from "@/src/components/navigation/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
        }}
      />
      <Tabs.Screen
        name="quick-order"
        options={{
          title: "Quick Order",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
