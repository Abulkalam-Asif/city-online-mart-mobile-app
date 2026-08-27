import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useCityContext } from "@/src/contexts/CityContext";
import { FontAwesome6 } from "@expo/vector-icons";

const GuestProfileView = () => {
  const router = useRouter();
  const { cities, selectedCity } = useCityContext();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/src/assets/logo.png")}
          style={styles.image}
          contentFit="contain"
        />
      </View>
      <Text style={styles.title}>Welcome to City Online Mart</Text>
      
      {selectedCity && (
        <Text style={styles.cityText}>
          Current City <Text style={styles.cityName}>{selectedCity.name}</Text>
        </Text>
      )}

      <Text style={styles.subtitle}>
        Login to manage your orders, profile, and more.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/login")}>
        <Text style={styles.loginButtonText}>Login / Create Account</Text>
      </Pressable>

      {cities.length > 1 && (
        <Pressable
          style={({ pressed }) => [
            styles.changeCityButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/city-select")}>
          <FontAwesome6 name="location-dot" size={16} color={theme.colors.primary} />
          <Text style={styles.changeCityButtonText}>Change City</Text>
        </Pressable>
      )}
    </View>
  );
};

export default GuestProfileView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 40,
    backgroundColor: "white",
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 80,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 5,
  },
  cityText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
    marginBottom: 15,
  },
  cityName: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
  },
  changeCityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  changeCityButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
});
