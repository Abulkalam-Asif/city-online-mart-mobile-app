import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import AccountSettingsButton from "./AccountSettingsButton";

const AccountSettingsSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.accountSettingText}>Account Settings</Text>
      <View style={styles.buttonsContainer}>
        <AccountSettingsButton
          text="Orders"
          href="/profile/orders"
          imageSrc={require("@/src/assets/icons/profile/orders.png")}
        />
        <AccountSettingsButton
          text="Settings"
          href="/profile/settings"
          imageSrc={require("@/src/assets/icons/profile/settings.png")}
        />
        <AccountSettingsButton
          text="My Favorites"
          href="/profile/my-favourites"
          imageSrc={require("@/src/assets/icons/profile/my-favourites.png")}
        />
        <AccountSettingsButton text="My Coupons" href="/profile/coupons" iconName="ticket-outline" />
        <AccountSettingsButton text="Share & Earn" href="/profile/share-earn" iconName="gift-outline" />
      </View>
    </View>
  );
};

export default AccountSettingsSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  accountSettingText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "column",
    gap: 10,
  },
});
