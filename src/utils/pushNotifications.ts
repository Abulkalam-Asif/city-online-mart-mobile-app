import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebaseConfig";
import { logger } from "./logger";

const DEVICE_TOKENS_SUBCOLLECTION = "deviceTokens";
const USERS_COLLECTION = "USERS";
const PUSH_TOKEN_STORAGE_KEY = "@push_token";

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
    let permissionSnapshot = existingPermissions;
    let finalStatus = existingPermissions.status;
    let canAskAgain = existingPermissions.canAskAgain;

    // Request permission if not already granted.
    if (finalStatus !== "granted") {
      const requestResult = await Notifications.requestPermissionsAsync();
      permissionSnapshot = requestResult;
      finalStatus = requestResult.status;
      canAskAgain = requestResult.canAskAgain;
    }

    const androidImportance =
      Platform.OS === "android"
        ? permissionSnapshot.android?.importance ?? null
        : null;
    const osNotificationsEnabled =
      Platform.OS === "android"
        ? androidImportance !== null
          ? androidImportance !== Notifications.AndroidImportance.NONE
          : permissionSnapshot.granted
        : permissionSnapshot.granted;

    // If permission is denied, update stored token metadata (if available) and stop here.
    if (finalStatus !== "granted") {
      logger.info(
        `Push: Permission not granted for user ${userId} (status=${finalStatus}, canAskAgain=${String(
          canAskAgain,
        )})`,
      );

      const cachedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (cachedToken) {
        const tokenRef = doc(
          db,
          USERS_COLLECTION,
          userId,
          DEVICE_TOKENS_SUBCOLLECTION,
          cachedToken,
        );

        await setDoc(
          tokenRef,
          {
            token: cachedToken,
            platform: Platform.OS,
            osPermissionStatus: finalStatus,
            osPermissionGranted: false,
            canAskAgain: typeof canAskAgain === "boolean" ? canAskAgain : null,
            permissionsLastCheckedAt: serverTimestamp(),
            osNotificationsEnabled,
            androidImportance,
            updatedAt: serverTimestamp(),
            lastSeenAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

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
        osPermissionStatus: finalStatus,
        osPermissionGranted: finalStatus === "granted",
        canAskAgain: typeof canAskAgain === "boolean" ? canAskAgain : null,
        permissionsLastCheckedAt: serverTimestamp(),
        osNotificationsEnabled,
        androidImportance,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      },
      { merge: true },
    );
    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    logger.info(`Push: Token stored for user ${userId}`);

    return token;
  } catch (error) {
    logger.error("registerPushTokenForUser", error);
    return null;
  }
};
