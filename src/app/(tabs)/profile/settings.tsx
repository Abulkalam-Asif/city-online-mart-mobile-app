import { ScrollView, StyleSheet, Switch, View, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { doc, getDoc, updateDoc } from "@react-native-firebase/firestore";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import SettingsButton from "@/src/components/tabs/profile/settings/SettingsButton";
import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { useAuthUser, useSignOut } from "@/src/hooks/useAuthUser";
import { db } from "@/firebaseConfig";
import { logger } from "@/src/utils/logger";

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [showNotificationError, setShowNotificationError] = useState(false);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState(
    "We could not update your notification settings. Please try again.",
  );

  const { data: authUser } = useAuthUser();
  const signOutMutation = useSignOut();

  /**
   * Toggle notifications for the current account and persist to Firestore.
   */
  const toggleNotifications = async (): Promise<void> => {
    if (!authUser?.uid || isUpdatingNotifications || isLoadingNotifications) {
      return;
    }

    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);
    setIsUpdatingNotifications(true);

    try {
      const userRef = doc(db, "USERS", authUser.uid);
      await updateDoc(userRef, { notificationsEnabled: nextValue });
      logger.info(
        `Notifications: preference updated (uid=${authUser.uid}, enabled=${nextValue})`,
      );
    } catch (error) {
      logger.error("Notifications: failed to update preference", error);
      setNotificationsEnabled((prev) => !prev);
      setNotificationErrorMessage(
        "We could not update your notification settings. Please try again.",
      );
      setShowNotificationError(true);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  useEffect(() => {
    /**
     * Load the stored notification preference for the current user.
     * Defaults to true if the preference is missing.
     */
    const loadNotificationPreference = async (): Promise<void> => {
      if (!authUser?.uid) {
        setIsLoadingNotifications(false);
        return;
      }

      setIsLoadingNotifications(true);

      try {
        const userRef = doc(db, "USERS", authUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          logger.error("Notifications: user doc missing", {
            uid: authUser.uid,
          });
          setIsLoadingNotifications(false);
          return;
        }

        const storedValue = userSnap.data()?.notificationsEnabled;
        const resolvedValue =
          typeof storedValue === "boolean" ? storedValue : true;

        setNotificationsEnabled(resolvedValue);

        if (typeof storedValue !== "boolean") {
          await updateDoc(userRef, { notificationsEnabled: resolvedValue });
        }
      } catch (error) {
        logger.error("Notifications: failed to load preference", error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotificationPreference();
  }, [authUser?.uid]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}>
      {showNotificationError && (
        <ErrorBanner
          title="Notifications"
          message={notificationErrorMessage}
          onDismiss={() => setShowNotificationError(false)}
        />
      )}
      <GeneralTopBar text="Settings" />
      <View style={styles.innerContainer}>
        <SettingsButton
          text="Notifications"
          icon={<FontAwesome6 name="bell" size={16} />}
          iconBgColor={theme.colors.primary_light}
          pressHandler={toggleNotifications}>
          <Switch
            trackColor={{ false: "#d1d5db", true: theme.colors.primary_light }}
            thumbColor={notificationsEnabled ? theme.colors.primary : "#f4f3f4"}
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            disabled={isLoadingNotifications || isUpdatingNotifications}
            style={{ marginLeft: "auto", height: 20 }}
          />
        </SettingsButton>
        <SettingsButton
          text="Sign Out"
          pressHandler={() => {
            Alert.alert(
              "Sign Out",
              "Are you sure you want to sign out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  style: "destructive",
                  onPress: async () => {
                    await signOutMutation.mutateAsync();
                    router.replace("/home");
                  },
                },
              ]
            );
          }}
          icon={
            <MaterialCommunityIcons
              name="logout"
              size={16}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          }
          iconBgColor={theme.colors.primary_light}
        />
        <SettingsButton
          text="Delete Account"
          pressHandler={() => { }}
          icon={<Feather name="user-x" size={16} />}
          iconBgColor={theme.colors.error_light}
        />
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  containerContent: {
    paddingBottom: 100,
  },
  innerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
});
