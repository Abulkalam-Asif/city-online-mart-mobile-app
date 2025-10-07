import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import IconButton from "@/src/components/general/IconButton";
import { router } from "expo-router";
import { theme } from "@/src/constants/theme";

const ReviewsTopBar = () => {
  return (
    <View style={styles.container}>
      <IconButton
        icon={<FontAwesome6 name="chevron-left" size={24} color={"#000"} />}
        onPress={() => {
          router.back();
        }}
      />
      <Text style={styles.reviewsText}>Reviews</Text>
    </View>
  );
};

export default ReviewsTopBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  reviewsText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 22,
    flex: 1,
    textAlign: "center",
    marginRight: 44,
  },
});
