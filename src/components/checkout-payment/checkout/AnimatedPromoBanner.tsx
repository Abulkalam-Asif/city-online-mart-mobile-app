import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/src/constants/theme";

interface AnimatedPromoBannerProps {
  onlineDiscountPercentage: number;
  isSelectedOnline: boolean;
}

const CONFETTI_COLORS = [
  "#FFD700", // Gold
  "#FF6B00", // Bright Orange
  "#007AFF", // Blue
  "#E91E63", // Pink
  "#ffffff", // White
  "#9C27B0", // Purple
  "#00E676", // Bright Green
];

interface ParticleProps {
  index: number;
}

const SingleConfettiPiece: React.FC<ParticleProps> = ({ index }) => {
  const translateY = useSharedValue(-5);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.9);

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const shapeType = index % 3;
  const delay = (index * 15) % 150;

  // Spread particles horizontally across banner width
  const initialX = (index - 9) * 22;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-16 - (index % 4) * 6, { duration: 600 }),
          withTiming(16 + (index % 5) * 5, { duration: 1000 }),
          withTiming(-5, { duration: 0 })
        ),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(initialX + 12, { duration: 550 }),
          withTiming(initialX - 12, { duration: 550 })
        ),
        -1,
        true
      )
    );

    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360 * (index % 2 === 0 ? 1 : -1), { duration: 1200 }),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.4, { duration: 500 })
        ),
        -1,
        true
      )
    );
  }, [delay, index, initialX, opacity, rotate, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const particleStyle =
    shapeType === 0
      ? { width: 6, height: 6, borderRadius: 3, backgroundColor: color }
      : shapeType === 1
      ? { width: 9, height: 4, borderRadius: 2, backgroundColor: color }
      : { width: 3, height: 11, borderRadius: 1.5, backgroundColor: color };

  return <Animated.View style={[styles.particle, particleStyle, animatedStyle]} />;
};

const ConfettiOverlay: React.FC = () => {
  const particles = Array.from({ length: 18 }, (_, i) => i);

  return (
    <View pointerEvents="none" style={styles.confettiContainer}>
      {particles.map((i) => (
        <SingleConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
};

const ContinuousGiftIcon: React.FC = () => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 650 }),
        withTiming(1, { duration: 650 })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 400 }),
        withTiming(8, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      true
    );
  }, [rotate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="gift" size={20} color="#fff" />
    </Animated.View>
  );
};

const PulsingSparkle: React.FC = () => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(0.8, { duration: 500 })
      ),
      -1,
      true
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="sparkles" size={16} color="#FFD700" />
    </Animated.View>
  );
};

export const AnimatedPromoBanner: React.FC<AnimatedPromoBannerProps> = ({
  onlineDiscountPercentage,
  isSelectedOnline,
}) => {
  if (onlineDiscountPercentage <= 0) return null;

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(14)}
      entering={FadeInDown.duration(350)}
      style={[styles.promoBanner, isSelectedOnline && styles.promoBannerSuccess]}
    >
      {isSelectedOnline && <ConfettiOverlay />}

      {isSelectedOnline ? (
        <ContinuousGiftIcon />
      ) : (
        <Ionicons name="pricetag" size={18} color="#fff" />
      )}

      <Animated.Text
        key={isSelectedOnline ? "congrats-text" : "promo-text"}
        entering={FadeIn.duration(250)}
        style={styles.promoText}
      >
        {isSelectedOnline
          ? `Congratulations! You are getting an extra ${onlineDiscountPercentage}% discount!`
          : `Get an extra ${onlineDiscountPercentage}% off by paying in advance with JazzCash, Easypaisa, or Bank Transfer!`}
      </Animated.Text>

      {isSelectedOnline && <PulsingSparkle />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  promoBanner: {
    backgroundColor: theme.colors.confirmed,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
    position: "relative",
    overflow: "hidden",
  },
  promoBannerSuccess: {
    backgroundColor: theme.colors.secondary,
  },
  promoText: {
    color: "#fff",
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    flex: 1,
    zIndex: 2,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  particle: {
    position: "absolute",
  },
});

export default AnimatedPromoBanner;
