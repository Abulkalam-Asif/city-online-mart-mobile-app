import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

const GuestProfileView = () => {
  const router = useRouter();

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
      <Text style={styles.subtitle}>
        Login to manage your orders, profile, and more.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && styles.loginButtonPressed,
        ]}
        onPress={() => router.push("/login")}>
        <Text style={styles.loginButtonText}>Login / Create Account</Text>
      </Pressable>
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
    paddingTop: 60,
    backgroundColor: "white",
  },
  imageContainer: {
    marginBottom: 30,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
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
  },
  loginButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});
