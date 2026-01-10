import { Dimensions, StyleSheet, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

const { width, height } = Dimensions.get("window");

const HomeTopBg = () => {
  return (
    <>
      <View
        style={[
          styles.container,
          {
            height: height * 0.25,
          },
        ]}></View>
    </>
  );
};

export default React.memo(HomeTopBg);

const styles = StyleSheet.create({
  container: {
    width: "120%",
    backgroundColor: theme.colors.primary,
    position: "absolute",
    top: 0,
    left: "-10%",
    zIndex: -1,
    borderBottomLeftRadius: width * 0.25,
    borderBottomRightRadius: width * 0.25,
  },
});
