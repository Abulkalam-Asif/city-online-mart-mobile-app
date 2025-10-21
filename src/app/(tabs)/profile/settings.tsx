import { ScrollView, StyleSheet, Switch, View } from "react-native";
import React, { useState } from "react";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import SettingsButton from "@/src/components/tabs/profile/settings/SettingsButton";
import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}>
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
            style={{ marginLeft: "auto", height: 20 }}
          />
        </SettingsButton>
        <SettingsButton
          text="Log Out"
          pressHandler={() => {}}
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
          pressHandler={() => {}}
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
