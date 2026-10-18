import { Pressable, Share, StyleSheet, Text } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { theme } from "@/src/constants/theme";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";

type SidebarProps = {
  isOpen: boolean;
  closeSidebarHandler: () => void;
};

const Sidebar = ({ isOpen, closeSidebarHandler }: SidebarProps) => {
  const translateX = useSharedValue(-300);
  const overlayOpacity = useSharedValue(0);

  const sidebarLinks = [
    { title: "About Us", onPress: () => router.push("/") },
    { title: "Privacy Policy", onPress: () => router.push("/") },
    {
      title: "Terms & Conditions",
      onPress: () => router.push("/"),
    },
    { title: "Help", onPress: () => router.push("/") },
    { title: "FAQs", onPress: () => router.push("/") },
    {
      title: "Returns & Refunds",
      onPress: () => router.push("/"),
    },
    {
      title: "Share My App",
      onPress: () => {
        Share.share({
          title: "City Online Mart",
          message: "Check out this awesome app: [App Link Here]",
        });
      },
    },
  ];

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
            key={link.title}
            onPress={() => {
              link.onPress();
              closeSidebarHandler();
            }}
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
