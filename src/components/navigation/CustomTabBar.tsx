import React from "react";
import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/src/constants/theme";
import { Image } from "expo-image";

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
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
        <Pressable style={styles.quickOrderButton} onPress={handleQuickOrder}>
          <View style={styles.quickOrderIconContainer}>
            <MaterialCommunityIcons name="whatsapp" size={34} color="white" />
          </View>
        </Pressable>
      )}

      {/* Rounded Tab Bar */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
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
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}>
              {getTabIcon(route.name, isFocused)}
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
    width: "90%",
    maxWidth: 450,
    flexDirection: "row",
    backgroundColor: "white",
    height: 70,
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 8,
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
    marginLeft: -20,
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
});

export default CustomTabBar;
