import { StyleSheet, Text, View, Pressable } from "react-native";
import React, { useState } from "react";
import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCityContext } from "@/src/contexts/CityContext";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSignOut } from "@/src/hooks/useAuthUser";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";

const ProfileTopSection = () => {
  const { user } = useAuth();
  const { cities, selectedCity, clearCity } = useCityContext();
  const signOutMutation = useSignOut();
  const [showCityModal, setShowCityModal] = useState(false);

  const handleConfirmChangeCity = async () => {
    setShowCityModal(false);
    try {
      // Log out from the current city
      await signOutMutation.mutateAsync();
      // Clear React Query cache
      const { queryClient } = await import("@/src/lib/react-query");
      queryClient.clear();
      // Clear city from context (which auto-redirects to /city-select)
      await clearCity();
    } catch (error) {
      console.error("Failed to change city safely", error);
    }
  };

  return (
    <View style={styles.container}>
      {user?.displayName && (
        <Text style={styles.username}>{user.displayName}</Text>
      )}
      <Text style={styles.phoneNumber}>{user?.phoneNumber}</Text>

      {selectedCity && (
        <Text style={styles.cityText}>
          Current City <Text style={styles.cityName}>{selectedCity.name}</Text>
        </Text>
      )}

      {cities.length > 1 && (
        <Pressable
          style={({ pressed }) => [
            styles.changeCityButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setShowCityModal(true)}>
          <FontAwesome6 name="location-dot" size={12} color={theme.colors.primary} />
          <Text style={styles.changeCityButtonText}>Change City</Text>
        </Pressable>
      )}

      <ConfirmationModal
        visible={showCityModal}
        title="Change City?"
        message="Switching to a different city will log you out of your current session. Do you wish to continue?"
        confirmText="Change City"
        cancelText="Cancel"
        variant="warning"
        iconName="location-outline"
        onConfirm={handleConfirmChangeCity}
        onCancel={() => setShowCityModal(false)}
      />
    </View>
  );
};

export default ProfileTopSection;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  username: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 4,
  },
  phoneNumber: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
  },
  cityText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
    marginBottom: 10,
  },
  cityName: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  changeCityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 6,
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  changeCityButtonText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
});
