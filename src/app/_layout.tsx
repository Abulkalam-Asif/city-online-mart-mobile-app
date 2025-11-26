import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import useMyFonts from "../hooks/useMyFonts";
import { queryClient } from "../lib/react-query";
import { theme } from "../constants/theme";
import { ModalProvider } from "../contexts/ModalContext";
import { ModalPortal } from "../components/common/ModalPortal";

export default function RootLayout() {
  const fontsLoaded = useMyFonts();

  return fontsLoaded ? (
    <QueryClientProvider client={queryClient}>
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
          </SafeAreaView>
        </ModalProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  ) : null;
}
