import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { db } from "../../firebaseConfig";
import { logger } from "./logger";

const DEVICE_TOKENS_SUBCOLLECTION = "deviceTokens";
const USERS_COLLECTION = "USERS";

/**
 * Ensure Android notification channel exists so foreground notifications can display.
 */
const ensureAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
};

/**
 * Resolve the Expo project ID for push token registration.
 */
const getProjectId = (): string | undefined => {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId
  );
};

/**
 * Register an Expo push token for the given user and upsert it in Firestore.
 * Returns the token or null if permission was denied or registration failed.
 */
export const registerPushTokenForUser = async (
  userId: string,
): Promise<string | null> => {
  try {
    logger.info(`Push: Registering token for user ${userId}`);
    // Android requires a notification channel for alerts to display.
    await ensureAndroidChannel();

    // Check current permission status.
    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.status;

    // Request permission if not already granted.
    if (finalStatus !== "granted") {
      const requestResult = await Notifications.requestPermissionsAsync();
      finalStatus = requestResult.status;
    }

    // If permission is denied, stop here.
    if (finalStatus !== "granted") {
      logger.info(`Push: Permission not granted for user ${userId}`);
      return null;
    }

    // Get Expo push token (requires EAS projectId in some builds).
    const projectId = getProjectId();
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;
    logger.info(`Push: Token acquired for user ${userId}`);

    // Store token under the user so each device can be tracked separately.
    const tokenRef = doc(
      db,
      USERS_COLLECTION,
      userId,
      DEVICE_TOKENS_SUBCOLLECTION,
      token,
    );

    await setDoc(
      tokenRef,
      {
        token,
        platform: Platform.OS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      },
      { merge: true },
    );
    logger.info(`Push: Token stored for user ${userId}`);

    return token;
  } catch (error) {
    logger.error("registerPushTokenForUser", error);
    return null;
  }
};
