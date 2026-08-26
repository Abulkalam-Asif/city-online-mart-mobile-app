const USE_EMULATOR = process.env.EXPO_PUBLIC_USE_EMULATOR === "true";
const EMULATOR_HOST = "10.0.2.2";

// Utility function to convert localhost URLs to work with Android emulator
export const convertEmulatorUrl = (url: string): string => {
  if (!url || !USE_EMULATOR) return url;
  
  // Replace localhost or 127.0.0.1 with the emulator host for Android
  return url.replace(/localhost|127\.0\.0\.1/, EMULATOR_HOST);
};
