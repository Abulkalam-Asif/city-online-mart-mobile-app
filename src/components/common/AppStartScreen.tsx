import { ActivityIndicator, StyleSheet, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";

type AppStartScreenProps = {
  /** Called once the artwork is on screen (SplashGate uses it to hide the native splash). */
  onReady?: () => void;
};

/**
 * Full-screen start screen: the groceries artwork (the logo is part of the image, so it scales
 * and crops with the artwork and looks the same on every phone) and a small spinner under the
 * logo. Shown while the app works out where to go (saved city, city list).
 */
const AppStartScreen = ({ onReady }: AppStartScreenProps) => (
  <View style={styles.container}>
    <Image
      source={require("@/src/assets/splash-bg.webp")}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      onDisplay={onReady}
    />
    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.spinner} />
  </View>
);

export default AppStartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  spinner: {
    position: "absolute",
    top: "58%", // just under the logo baked into the artwork (logo is centred at 49.5%)
  },
});
