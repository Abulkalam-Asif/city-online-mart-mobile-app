import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import useMyFonts from "../hooks/useMyFonts";
import { queryClient } from "../lib/react-query";
import { ModalProvider } from "../contexts/ModalContext";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { ModalPortal } from "../components/common/ModalPortal";
import PushNotificationHandler from "../components/notifications/PushNotificationHandler";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <SafeAreaProvider>
              <ModalProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#3A591E' }}>
                  <StatusBar style="light" backgroundColor="#3A591E" />
                  <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                      }}>
                      <Stack.Screen name="index" />
                      <Stack.Screen name="(tabs)" />
                    </Stack>
                    <ModalPortal />
                    <PushNotificationHandler />
                  </View>
                </SafeAreaView>
              </ModalProvider>
            </SafeAreaProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
