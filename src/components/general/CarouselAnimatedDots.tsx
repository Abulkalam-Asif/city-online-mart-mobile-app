import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import { theme } from "@/src/constants/theme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type CarouselAnimatedDotsProps = {
  bannersCount: number;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  carouselRef: React.RefObject<any>;
  horizontalPosition?: "flex-start" | "center" | "flex-end";
};

const CarouselAnimatedDots = ({
  bannersCount,
  currentIndex,
  carouselRef,
  setCurrentIndex,
  horizontalPosition = "center",
}: CarouselAnimatedDotsProps) => {
  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index, animated: true });
    }
  };

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
            isActive={index === currentIndex}
            index={index}
            handleDotPress={handleDotPress}
          />
        ))}
      </View>
    </>
  );
};

export default CarouselAnimatedDots;

// Create a proper animated dot component
const AnimatedDot = ({
  isActive,
  index,
  handleDotPress,
}: {
  isActive: boolean;
  index: number;
  handleDotPress: (index: number) => void;
}) => {
  const dotWidth = useSharedValue(isActive ? 30 : 10);

  useEffect(() => {
    dotWidth.value = withSpring(isActive ? 30 : 10, {
      duration: 500,
    });
  }, [isActive, dotWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
  }));

  return (
    <Pressable hitSlop={4} onPress={() => handleDotPress(index)}>
      <Animated.View
        style={[
          styles.paginationDot,
          animatedStyle,
          {
            backgroundColor: isActive
              ? theme.colors.primary
              : theme.colors.placeholder,
          },
        ]}
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
