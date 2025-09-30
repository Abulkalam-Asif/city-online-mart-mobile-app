import React, { useState } from "react";
import { StyleSheet, View, Modal, Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMainBanner } from "@/src/hooks/useBanners";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MainBanner = () => {
  const { data: mainBanner, isLoading } = useMainBanner();
  const [isVisible, setIsVisible] = useState(true);

  // Don't show if loading, no data, or user has dismissed
  if (isLoading || !mainBanner || !isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleBannerPress = () => {
    // Handle banner tap - navigate based on LinkType, CategoryId, ProductId
    console.log("Main banner pressed:", mainBanner);
    // You can add navigation logic here based on the banner's LinkType
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.bannerContainer}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>

          {/* Banner Image */}
          <Pressable onPress={handleBannerPress} style={styles.imageContainer}>
            <Image
              source={{ uri: mainBanner.PictureUrl }}
              style={styles.bannerImage}
              contentFit="cover"
            />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default MainBanner;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bannerContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    maxWidth: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.7,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
  },
  bannerImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9 * 0.75, // 4:3 aspect ratio
    minHeight: 200,
  },
});
