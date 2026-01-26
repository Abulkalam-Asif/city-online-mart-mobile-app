import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import useMyFonts from "../hooks/useMyFonts";
import { queryClient } from "../lib/react-query";
import { theme } from "../constants/theme";
import { ModalProvider } from "../contexts/ModalContext";
import { AuthProvider } from "../contexts/AuthContext";
import { ModalPortal } from "../components/common/ModalPortal";
import NotificationManager from "../components/notifications/NotificationManager";

import * as SplashScreen from "expo-splash-screen";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const fontsLoaded = useMyFonts();

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <ModalProvider>
            <SafeAreaView style={{ flex: 1 }}>
              <StatusBar style="auto" backgroundColor={theme.colors.primary} />
              <Stack
                screenOptions={{
                  headerShown: false,
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
              </Stack>
              <ModalPortal />
              <NotificationManager />
            </SafeAreaView>
          </ModalProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
