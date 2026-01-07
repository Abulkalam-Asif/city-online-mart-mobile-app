import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";

interface LoadingProps extends React.ComponentProps<typeof View> {
  text?: string;
  size?: number | "small" | "large" | undefined;
}

const Loading = ({ text, size = "large", ...props }: LoadingProps) => {
  return (
    <>
      <View style={styles.loadingContainer} {...props}>
        <ActivityIndicator size={size} color={theme.colors.primary} />
        {text && <Text style={styles.loadingText}>{text}</Text>}
      </View>
    </>
  );
};

export default Loading;

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.text_secondary,
    fontFamily: theme.fonts.regular,
  },
});
