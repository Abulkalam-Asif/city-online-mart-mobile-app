import { Stack, useRouter, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";

export default function RootLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user logs out while on a deep screen (like settings), 
    // we want to ensure they see the guest view (index), not stay on settings.
    if (!loading && !user) {
      // Check if we are deeper than the profile root
      if (pathname.includes("/profile/") && pathname !== "/profile") {
        router.dismissAll(); // Go back to root of this stack
        router.replace("/profile");
      }
    }
  }, [user, loading, pathname]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="my-favourites" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
