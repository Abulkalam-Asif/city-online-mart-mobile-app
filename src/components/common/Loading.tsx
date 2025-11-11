import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

type LoadingProps = {
  text?: string;
};

const Loading = ({ text }: LoadingProps) => {
  return (
    <>
      <View style={styles.productsLoading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {text && <Text style={styles.loadingText}>{text}</Text>}
      </View>
    </>
  );
};

export default Loading;

const styles = StyleSheet.create({
  productsLoading: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.text_secondary,
    fontFamily: theme.fonts.regular,
  },
});
