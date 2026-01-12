import React, { useState, useEffect } from "react";
import { StyleSheet, View, Modal, Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useGetPopupBanner } from "@/src/hooks/useBanners";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

let hasShownPopupThisSession = false;

const PopupBanner = () => {
  const { data: popupBanner, isLoading, error: errorGettingPopupBanner } = useGetPopupBanner();
  const [isVisible, setIsVisible] = useState(false);

  // Show popup banner if it exists and hasn't been shown this session
  useEffect(() => {
    if (!popupBanner || hasShownPopupThisSession) {
      return;
    }
    hasShownPopupThisSession = true;
    setIsVisible(true);
  }, [popupBanner]);

  // Don't show if loading, no data, or not visible
  if (isLoading || !popupBanner || !isVisible || errorGettingPopupBanner) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleBannerPress = () => {
    // Close modal first before navigation
    setIsVisible(false);

    if (popupBanner.linkType === "product") {
      router.push(`/product-details?id=${popupBanner.link}`);
    } else if (popupBanner.linkType === "category") {
      router.push(`/categories?categoryId=${popupBanner.link}`);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.contentWrapper}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#000" />
          </Pressable>
          <Pressable onPress={handleBannerPress} style={styles.imageContainer}>
            <Image
              source={popupBanner.imageUrl}
              style={styles.bannerImage}
              contentFit="contain"
            />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default PopupBanner;

const BANNER_WIDTH = SCREEN_WIDTH * 0.9;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    alignItems: "flex-end", // Align close button to right
  },
  closeButton: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    overflow: "hidden",
  },
  bannerImage: {
    width: BANNER_WIDTH,
    height: BANNER_WIDTH, // Square, image will maintain aspect via contentFit
  },
});
