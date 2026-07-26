import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { Image } from "expo-image";

import { format, parse } from "date-fns";
import { formatSlotTimeRange } from "@/src/utils/slotUtils";

interface ExpectedDeliveryTimeSectionProps {
  slot?: {
    date: string;
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  } | null;
}

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

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={styles.expectedDeliveryText}>Expected Delivery Schedule</Text>
        <View style={styles.timeDateContainer}>
          <Text style={[styles.timeText, isExpress && { color: theme.colors.express }]}>{timeDisplay}</Text>
          {dateDisplay && <Text style={styles.dateText}>{dateDisplay}</Text>}
        </View>
      </View>
      <Image source={require("@/src/assets/rider.png")} style={styles.image} />
    </View>
  );
};

export default ExpectedDeliveryTimeSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expectedDeliveryText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },
  timeDateContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
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
    width: 60,
    height: 60,
  },
});
