import { Tabs, Redirect } from "expo-router";
import React from "react";
import CustomTabBar from "@/src/components/navigation/CustomTabBar";
import { ModalPortal } from "@/src/components/common/ModalPortal";
import { useCityContext } from "@/src/contexts/CityContext";

export default function TabsLayout() {
  const { isCityReady, citiesLoading } = useCityContext();

  if (!citiesLoading && !isCityReady) {
    return <Redirect href={"/city-select" as any} />;
  }

  return (
    <>
      <Tabs
        tabBar={(props) => {
          // Check if current route is cart
          const currentRouteName = props.state.routes[props.state.index].name;

          // Don't render tab bar on cart screen
          if (currentRouteName === "cart") {
            return null;
          }

          return <CustomTabBar {...props} />;
        }}
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
      <ModalPortal />
    </>
  );
}
