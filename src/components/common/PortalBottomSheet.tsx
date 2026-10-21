import React, { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/src/constants/theme";
import { useModal } from "@/src/contexts/ModalContext";

type PortalBottomSheetProps = {
  id: string;
  isVisible: boolean;
  onClose: () => void;
  bottomSheetType: string | null;
  children: React.ReactNode;
};

const PortalBottomSheetContent = ({
  isVisible,
  onClose,
  bottomSheetType,
  children,
}: Omit<PortalBottomSheetProps, "id">) => {
  const translateY = useSharedValue(500);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0);
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(500);
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible, translateY, overlayOpacity]);

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: isVisible ? "auto" : "none",
  }));

  return (
    <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      <Animated.View
        style={[
          styles.container,
          bottomSheetAnimatedStyle,
          {
            height:
              bottomSheetType === "sort"
                ? 450
                : bottomSheetType === "brands"
                ? 550
                : 0,
          },
        ]}>
        <View style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.title}>
            {bottomSheetType === "sort"
              ? "Sort By"
              : bottomSheetType === "brands"
              ? "Brands"
              : ""}
          </Text>
        </View>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

export const PortalBottomSheet = ({
  id,
  isVisible,
  onClose,
  bottomSheetType,
  children,
}: PortalBottomSheetProps) => {
  const { showModal, hideModal } = useModal();

  // The sheet is drawn by ModalContext, not by a native Modal, so Android Back
  // would go to the previous screen and leave the sheet open. Close it first.
  useEffect(() => {
    if (!isVisible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      showModal(
        id,
        <PortalBottomSheetContent
          isVisible={isVisible}
          onClose={() => {
            hideModal(id);
            onClose();
          }}
          bottomSheetType={bottomSheetType}>
          {children}
        </PortalBottomSheetContent>
      );
    } else {
      hideModal(id);
    }

    // Cleanup on unmount
    return () => {
      hideModal(id);
    };
  }, [isVisible, id, bottomSheetType, children, showModal, hideModal, onClose]);

  return null; // This component doesn't render anything directly
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    alignItems: "center",
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.placeholder,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
});
