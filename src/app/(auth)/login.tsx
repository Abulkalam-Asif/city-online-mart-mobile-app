import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { theme } from "@/src/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import LoginContentBg from "@/src/components/auth/login/LoginContentBg";
import { useSendOTP, useSignInWithoutOTP } from "@/src/hooks/useAuthUser";
import { useAuthSettings } from "@/src/hooks/useSettings";
import { FontAwesome6 } from "@expo/vector-icons";

const LoginScreen = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: authSettings, isLoading: settingsLoading } = useAuthSettings();

  // Default to secure state (OTP required) if settings are missing/loading
  const requireOTP = authSettings?.requireOTP ?? true;

  const sendOTPMutation = useSendOTP();
  const signInWithoutOTPMutation = useSignInWithoutOTP();

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 11) {
      Alert.alert(
        "Invalid Number",
        `Please enter a valid ${11}-digit mobile number.`,
      );
      return;
    }

    setLoading(true);
    try {
      if (requireOTP) {
        await sendOTPMutation.mutateAsync(phoneNumber);

        // Navigate to OTP screen with verification ID and phone
        router.push({
          pathname: "/verify-otp",
          params: { phoneNumber },
        });
      } else {
        await signInWithoutOTPMutation.mutateAsync(phoneNumber);
        // Navigate home on success
        router.replace("/home");
      }
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      keyboardShouldPersistTaps="handled">

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
          onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={24} color={"white"} />
        </Pressable>
      </View>

      <View style={styles.headerContainer}>
        <Image
          source={require("@/src/assets/logo.png")}
          style={styles.logoImage}
        />
      </View>

      <View style={styles.mainContent}>
        <LoginContentBg />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitleText}>
            Welcome to Apna Online Store
          </Text>
          <Text style={styles.welcomeSubtitle}>Login or Create Account</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter your Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="03000000000"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
              placeholderTextColor={theme.colors.placeholder}
              editable={!loading}
            />
          </View>

          {/* Send Button */}
          <Pressable
            style={({ pressed }) => [
              styles.sendOTPButton,
              (pressed || loading) && styles.sendOTPButtonPressed,
              loading && { backgroundColor: theme.colors.text_secondary },
            ]}
            onPress={handleSendOTP}
            disabled={loading}>
            {loading || settingsLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendOTPButtonText}>
                {requireOTP ? "Send OTP" : "Login"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  containerContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  logoImage: {
    width: 200,
    height: 75,
    borderRadius: 16,
  },

  mainContent: {
    flex: 1,
    position: "relative",
  },
  welcomeContainer: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeTitleText: {
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 20,
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  sendOTPButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  sendOTPButtonPressed: {
    opacity: 0.8,
  },
  sendOTPButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});
