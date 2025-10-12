import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { Image } from "expo-image";

const ExpectedDeliveryTimeSection = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.expectedDeliveryText}>Expected Delivery time</Text>
        <View style={styles.timeDateContainer}>
          <Text style={styles.timeText}>6:00 PM</Text>
          <Text style={styles.dateText}>Friday, 26th September</Text>
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
