import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import Animated, {
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";

type CarouselAnimatedDotsProps = {
  bannersCount: number;
  horizontalPosition?: "flex-start" | "center" | "flex-end";
  progressValue: SharedValue<number>;
};

const CarouselAnimatedDots = ({
  bannersCount,
  horizontalPosition = "center",
  progressValue,
}: CarouselAnimatedDotsProps) => {
  return (
    <>
      <View
        style={[
          styles.paginationContainer,
          { justifyContent: horizontalPosition },
        ]}>
        {Array.from({ length: bannersCount }).map((_, index) => (
          <AnimatedDot
            key={index}
            index={index}
            totalCount={bannersCount}
            progressValue={progressValue}
          />
        ))}
      </View>
    </>
  );
};

export default CarouselAnimatedDots;

// Create a proper animated dot component
const AnimatedDot = ({
  index,
  totalCount,
  progressValue,
}: {
  index: number;
  totalCount: number;
  progressValue: SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = progressValue.value;

    // Handle circular carousel behavior
    // Calculate the shortest distance considering wrap-around
    let effectiveProgress = progress;

    // If we're at the last index and progress is near 0, adjust for wrap-around
    if (index === 0 && progress > totalCount - 1.5) {
      effectiveProgress = progress - totalCount;
    }
    // If we're at index 0 and progress is near the last index, we're wrapping backward
    else if (index === totalCount - 1 && progress < 0.5) {
      effectiveProgress = progress + totalCount;
    }

    const inputRange = [index - 1, index, index + 1];
    const outputRange = [10, 30, 10];

    const width = interpolate(
      effectiveProgress,
      inputRange,
      outputRange,
      "clamp"
    );

    // Interpolate opacity for smoother transition
    const opacity = interpolate(
      effectiveProgress,
      inputRange,
      [0.4, 1, 0.4],
      "clamp"
    );

    return {
      width,
      opacity,
    };
  });

  const colorStyle = useAnimatedStyle(() => {
    const progress = progressValue.value;

    // Handle circular carousel behavior for color as well
    let effectiveProgress = progress;

    if (index === 0 && progress > totalCount - 1.5) {
      effectiveProgress = progress - totalCount;
    } else if (index === totalCount - 1 && progress < 0.5) {
      effectiveProgress = progress + totalCount;
    }

    // Interpolate color between inactive and active states
    const inputRange = [index - 0.5, index, index + 0.5];

    // Use opacity to blend between colors smoothly
    const colorOpacity = interpolate(
      effectiveProgress,
      inputRange,
      [0, 1, 0],
      "clamp"
    );

    return {
      backgroundColor:
        colorOpacity > 0.5 ? theme.colors.primary : theme.colors.placeholder,
    };
  });

  return (
    <Pressable hitSlop={4}>
      <Animated.View
        style={[styles.paginationDot, animatedStyle, colorStyle]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 26,
    gap: 8,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
  },
});
