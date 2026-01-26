import { ScrollView, StyleSheet, Text } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import ProfileTopSection from "@/src/components/tabs/profile/ProfileTopSection";
import AccountSettingsSection from "@/src/components/tabs/profile/AccountSettingsSection";
import { useAuth } from "@/src/contexts/AuthContext";
import GuestProfileView from "@/src/components/tabs/profile/GuestProfileView";

const ProfileScreen = () => {
  const { user } = useAuth();

  if (!user) {
    return <GuestProfileView />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}>
      <Text style={styles.myProfileText}>My Profile</Text>
      <ProfileTopSection />
      <AccountSettingsSection />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  containerContent: {
    paddingBottom: 100,
  },
  myProfileText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 22,
    flex: 1,
    textAlign: "center",
    marginTop: 20,
  },
});
