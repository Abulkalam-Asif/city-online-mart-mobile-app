import { StyleSheet, View } from "react-native";
import React from "react";

// Bottom bar of a screen. Its top edge has a soft shadow, so the content above it
// looks like it scrolls underneath. Put it after the ScrollView, inside the screen's column.
const ScreenFooter = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.container}>{children}</View>;
};

export default ScreenFooter;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
    boxShadow: "0 -2px 6px rgba(0, 0, 0, 0.06)",
  },
});
