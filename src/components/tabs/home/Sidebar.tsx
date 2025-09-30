import { Pressable, StyleSheet, Text } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { theme } from "@/src/constants/theme";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";

type SidebarProps = {
  isOpen: boolean;
  closeSidebarHandler: () => void;
};
const sidebarLinks = [
  { title: "About Us", href: "/about-us" },
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms & Conditions", href: "/terms-conditions" },
  { title: "Help", href: "/help" },
  { title: "FAQs", href: "/faqs" },
  { title: "Returns & Refunds", href: "/returns-refunds" },
];

const Sidebar = ({ isOpen, closeSidebarHandler }: SidebarProps) => {
  const translateX = useSharedValue(-300);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0);
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withSpring(-300);
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen, translateX, overlayOpacity]);

  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: isOpen ? "auto" : "none",
  }));

  return (
    <>
      <Animated.View
        style={[styles.overlay, overlayAnimatedStyle]}
        pointerEvents={isOpen ? "auto" : "none"}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={closeSidebarHandler}
        />
      </Animated.View>
      <Animated.ScrollView
        style={[styles.container, sidebarAnimatedStyle]}
        showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={closeSidebarHandler}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}>
          <AntDesign name="close" size={20} color="#fff" />
        </Pressable>
        {sidebarLinks.map((link) => (
          <Pressable
            key={link.href}
            onPress={closeSidebarHandler}
            style={({ pressed }) => [
              styles.link,
              pressed && styles.linkPressed,
            ]}>
            <Text style={styles.linkText}>{link.title}</Text>
            <FontAwesome6 name="chevron-right" size={16} color="#fff" />
          </Pressable>
        ))}
      </Animated.ScrollView>
    </>
  );
};

export default Sidebar;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: theme.colors.primary,
    width: "70%",
    maxWidth: 300,
    height: "100%",
    zIndex: 10000,
  },
  closeButton: {
    marginTop: 8,
    marginRight: 8,
    padding: 12,
    alignSelf: "flex-end",
    borderRadius: 24,
  },
  closeButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  link: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  linkText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: theme.fonts.medium,
  },
});
