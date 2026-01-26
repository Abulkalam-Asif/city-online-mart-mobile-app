import React from "react";
import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/src/constants/theme";
import { Image } from "expo-image";
import { useCartItemCount } from "@/src/hooks/useCart";

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const cartItemCount = useCartItemCount();

  const handleQuickOrder = () => {
    // Handle WhatsApp quick order
    const phoneNumber = "+923207303810"; // Replace with your WhatsApp business number
    const message = "Hi! I'd like to place a quick order.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to web WhatsApp
          const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
            message
          )}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused
      ? theme.colors.primary
      : theme.colors.text_secondary;
    const size = 24;

    switch (routeName) {
      case "home":
        return (
          <Image
            source={require("@/src/assets/icons/navigation/home.png")}
            style={{ width: size, height: size, tintColor: color }}
          />
        );
      case "categories":
        return (
          <Image
            source={require("@/src/assets/icons/navigation/categories.png")}
            style={{ width: size, height: size, tintColor: color }}
          />
        );
      case "cart":
        return (
          <Image
            source={require("@/src/assets/icons/navigation/cart.png")}
            style={{ width: size, height: size, tintColor: color }}
          />
        );
      case "profile":
        return (
          <Image
            source={require("@/src/assets/icons/navigation/profile.png")}
            style={{ width: size, height: size, tintColor: color }}
          />
        );
      default:
        return <MaterialIcons name="home" size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating WhatsApp Button */}
      {state.routes.some((route) => route.name === "quick-order") && (
        <Pressable
          style={({ pressed }) => [
            styles.quickOrderButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleQuickOrder}>
          <View style={styles.quickOrderIconContainer}>
            <MaterialCommunityIcons name="whatsapp" size={34} color="white" />
          </View>
          <Text style={[styles.tabLabel, { color: theme.colors.primary }]}>
            Quick Order
          </Text>
        </Pressable>
      )}

      {/* Rounded Tab Bar */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title;
          const isFocused = state.index === index;

          // Reserve space for the quick-order (floating) button so all tabs have equal width
          if (route.name === "quick-order") {
            return <View key={route.key} style={styles.tabItem} />;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            } else if (isFocused) {
              // Reset stack to root when tapping active tab
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{ name: route.name }],
                }),
                target: state.key,
              });
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && styles.tabItemPressed,
              ]}>
              <View>
                {getTabIcon(route.name, isFocused)}
                {route.name === "cart" && cartItemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? theme.colors.primary : "#666" },
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 50,
    paddingHorizontal: 10,
  },
  tabBar: {
    maxWidth: 450,
    flexDirection: "row",
    backgroundColor: "white",
    height: 70,
    borderRadius: 36,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
  },
  tabItemPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: theme.fonts.medium,
    fontWeight: "500",
  },
  quickOrderButton: {
    position: "absolute",
    top: -20,
    left: "50%",
    marginLeft: -14,
    zIndex: 60,
  },
  quickOrderIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontFamily: theme.fonts.semibold,
    fontWeight: "600",
    lineHeight: 9,
  },
});

export default CustomTabBar;
