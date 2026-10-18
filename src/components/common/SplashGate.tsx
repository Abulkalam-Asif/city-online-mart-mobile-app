import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCityContext } from "@/src/contexts/CityContext";
import AppStartScreen from "@/src/components/common/AppStartScreen";

// The start screen stays at least this long once it is on screen, so it is seen, not flashed
const MIN_VISIBLE_MS = 1500;
// If the city list cannot be loaded in this time, remove the start screen anyway (the app then
// shows its own loading or error state)
const MAX_VISIBLE_MS = 8000;
// If the artwork is slow to decode, hide the native splash anyway after this long
const NATIVE_SPLASH_FALLBACK_MS = 1000;
const FADE_MS = 350;

/**
 * Start sequence: the native splash (white, cart icon) shows while the app boots, then this full-screen
 * start screen takes over (artwork and logo) until the saved city and the city list are known, and
 * fades out into the real first screen (home skeleton or city selection).
 * Mount once, last inside CityProvider, so it paints over the rest of the app.
 */
const SplashGate = () => {
  const { citiesLoading } = useCityContext();
  const [minElapsed, setMinElapsed] = useState(false);
  const [maxElapsed, setMaxElapsed] = useState(false);
  const [removed, setRemoved] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const nativeSplashHidden = useRef(false);
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReady = useCallback(() => {
    if (nativeSplashHidden.current) return;
    nativeSplashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
    minTimer.current = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
  }, []);

  useEffect(() => {
    const fallback = setTimeout(handleReady, NATIVE_SPLASH_FALLBACK_MS);
    const max = setTimeout(() => setMaxElapsed(true), MAX_VISIBLE_MS);
    return () => {
      clearTimeout(fallback);
      clearTimeout(max);
      if (minTimer.current) clearTimeout(minTimer.current);
    };
  }, [handleReady]);

  const done = (!citiesLoading && minElapsed) || maxElapsed;

  useEffect(() => {
    if (!done) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(() => setRemoved(true));
  }, [done, opacity]);

  if (removed) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay, { opacity }]}
      pointerEvents={done ? "none" : "auto"}>
      {/* The artwork is light: dark status bar icons while it is up (reverts when it is removed) */}
      <StatusBar style="dark" />
      <AppStartScreen onReady={handleReady} />
    </Animated.View>
  );
};

export default SplashGate;

const styles = StyleSheet.create({
  overlay: {
    zIndex: 10000,
    elevation: 10000,
  },
});
