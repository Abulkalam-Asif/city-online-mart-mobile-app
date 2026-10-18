import { DimensionValue, StyleProp, View, ViewStyle } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/src/constants/theme";

type SkeletonPulseProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Wraps a group of SkeletonBox shapes and fades the whole group in and out.
 * One animation per group (not per shape): cheaper, and every shape pulses in sync.
 */
export const SkeletonPulse = ({ children, style }: SkeletonPulseProps) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.set(
      withRepeat(
        withTiming(0.45, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1, // forever
        true, // back and forth
      ),
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

type SkeletonBoxProps = {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** A plain grey placeholder shape. Put it inside a SkeletonPulse. */
export const SkeletonBox = ({
  width,
  height,
  radius = 8,
  color = theme.colors.background,
  style,
}: SkeletonBoxProps) => (
  <View
    style={[
      { width, height, borderRadius: radius, backgroundColor: color },
      style,
    ]}
  />
);
