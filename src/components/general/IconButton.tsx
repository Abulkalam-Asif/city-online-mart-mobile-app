import { Pressable, StyleSheet, Animated, View } from "react-native";
import React, { useRef } from "react";

type IconButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: number;
};

const IconButton = ({ icon, onPress, size = 44 }: IconButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    // Scale down animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Ripple animation
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Scale back to normal
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Calculate ripple size based on button size
  const maxRippleSize = size * 1.5;

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxRippleSize],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.4, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      <Pressable
        style={[styles.button, { borderRadius: size / 2 }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />

        {/* Icon Container */}
        <View style={styles.iconContainer}>{icon}</View>
      </Pressable>
    </Animated.View>
  );
};

export default IconButton;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  ripple: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
