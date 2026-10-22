import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "@/src/constants/theme";
import LottieView from "lottie-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { format, parse } from "date-fns";
import { formatSlotTimeRange } from "@/src/utils/slotUtils";

interface ExpectedDeliveryTimeSectionProps {
  slot?: {
    date: string;
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    expressDurationMinutes?: number;
  } | null;
}

// The green scooter animation (4:3, drawn facing left like the original picture, speed lines behind it).
const RIDER_WIDTH = 112;
const RIDER_HEIGHT = 84;
const MIRROR_RIDER = true; // it is drawn facing left, so mirror it to drive to the right
const SIDE_PADDING = 16; // the card's own padding; the scooter's lane runs the full width of the card
const TEXT_GAP = 8;

// One loop, in milliseconds: the scooter drives in with the slot text trailing behind it, stays
// while the slot can be read, then drives straight on and out of the card, and comes again.
const ENTER_MS = 1500;
const HOLD_MS = 3500;
const EXIT_MS = 1900;
const PAUSE_MS = 400;
const LOOP_MS = ENTER_MS + HOLD_MS + EXIT_MS + PAUSE_MS;

const ExpectedDeliveryTimeSection: React.FC<ExpectedDeliveryTimeSectionProps> = ({ slot }) => {
  const isExpress = slot?.id === "fast-delivery";

  const timeDisplay = isExpress
    ? `⚡ Express Delivery (Within ${slot?.expressDurationMinutes || 45}m)`
    : slot
    ? formatSlotTimeRange(slot.startTime, slot.endTime)
    : "Standard Delivery";

  const dateDisplay = isExpress
    ? null
    : slot && slot.date && slot.date !== "fast"
    ? format(parse(slot.date, "yyyy-MM-dd", new Date()), "EEEE, d MMMM")
    : "Next Available Schedule";

  // Full width of the card, measured once it is laid out.
  const [trackWidth, setTrackWidth] = useState(0);
  const parkX = Math.max(trackWidth - SIDE_PADDING - RIDER_WIDTH, 0); // where the scooter stays
  const startX = -RIDER_WIDTH - 24; // just outside the card on the left
  const textWidth = Math.max(parkX - SIDE_PADDING - TEXT_GAP, 0);
  // Far enough that the text hanging behind the scooter has left the card too; if it stopped
  // earlier the text would sit there, cut off, until the loop starts again.
  const endX = trackWidth + textWidth + TEXT_GAP + 24;

  // 0 -> 1 over one loop; the positions below are worked out from it.
  const loop = useSharedValue(0);
  useEffect(() => {
    if (!trackWidth) return;
    loop.value = 0;
    loop.value = withRepeat(
      withTiming(1, { duration: LOOP_MS, easing: Easing.linear }),
      -1,
      false
    );
  }, [trackWidth, loop]);

  // Left edge of the scooter along the lane.
  const scooterX = useDerivedValue(() => {
    const ms = loop.value * LOOP_MS;
    if (ms < ENTER_MS) {
      const q = ms / ENTER_MS;
      const eased = 1 - Math.pow(1 - q, 3); // arrives fast, settles gently
      return startX + (parkX - startX) * eased;
    }
    if (ms < ENTER_MS + HOLD_MS) return parkX;
    if (ms < ENTER_MS + HOLD_MS + EXIT_MS) {
      const q = (ms - ENTER_MS - HOLD_MS) / EXIT_MS;
      return parkX + (endX - parkX) * q * q * q; // pulls away, faster and faster
    }
    return endX;
  });

  const riderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scooterX.value }, { scaleX: MIRROR_RIDER ? -1 : 1 }],
  }));

  // The slot text hangs behind the scooter and travels with it.
  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scooterX.value - TEXT_GAP - textWidth }],
  }));

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.expectedDeliveryText}>Expected Delivery Schedule</Text>
      <View style={styles.track} onLayout={onTrackLayout}>
        <Animated.View style={[styles.textBlock, { width: textWidth }, textStyle]}>
          <Text style={[styles.timeText, isExpress && { color: theme.colors.express }]}>{timeDisplay}</Text>
          {dateDisplay && <Text style={styles.dateText}>{dateDisplay}</Text>}
        </Animated.View>
        <Animated.View style={[styles.rider, riderStyle]}>
          <LottieView
            source={require("@/src/assets/animations/delivery-scooter-green.json")}
            autoPlay
            loop
            style={styles.image}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default ExpectedDeliveryTimeSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: SIDE_PADDING,
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
    overflow: "hidden",
  },
  expectedDeliveryText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },
  track: {
    height: RIDER_HEIGHT,
    marginTop: 8,
    marginHorizontal: -SIDE_PADDING, // runs edge to edge so the scooter can leave the card
  },
  textBlock: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    gap: 2,
  },
  rider: {
    position: "absolute",
    left: 0,
    top: 0,
    width: RIDER_WIDTH,
    height: RIDER_HEIGHT,
  },
  timeText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  dateText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
  },
  image: {
    width: RIDER_WIDTH,
    height: RIDER_HEIGHT,
  },
});
