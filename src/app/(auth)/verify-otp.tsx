import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { theme } from "@/src/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useVerifyOTP } from "@/src/hooks/useAuthUser";
import { FontAwesome6 } from "@expo/vector-icons";
import { authService } from "@/src/services";
import { Image } from "expo-image";
import LoginContentBg from "@/src/components/auth/login/LoginContentBg";

const VerifyOTPScreen = () => {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOTPMutation = useVerifyOTP();
  const inputRef = useRef<TextInput>(null);

  // Check for valid session on mount
  useEffect(() => {
    if (!authService.pendingConfirmation) {
      Alert.alert(
        "Session Expired",
        "Your verification session has expired. Please try again.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    }
  }, []);

  const handleVerify = async (code: string = otpCode) => {
    if (code.length !== 6) {
      return;
    }

    setLoading(true);
    try {
      await verifyOTPMutation.mutateAsync(code);
      // Navigate home or to previous screen on success
      router.replace("/home");
    } catch (error: any) {
      Alert.alert(
        "Verification Failed",
        "Invalid OTP code. Please try again.",
      );
      setOtpCode(""); // Clear on failure
    } finally {
      setLoading(false);
    }
  };

  const onCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setOtpCode(cleaned);

    if (cleaned.length === 6) {
      Keyboard.dismiss();
      handleVerify(cleaned);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      keyboardShouldPersistTaps="handled">
      {/* Header with Back Button */}
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
        <View style={styles.content}>
          <Text style={styles.titleText}>Confirm your Number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.phoneNumberText}>{phoneNumber}</Text>
          </Text>

          <View style={styles.otpContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.otpInput, { letterSpacing: 10 }]}
              value={otpCode}
              onChangeText={onCodeChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              placeholder="000000"
              placeholderTextColor={theme.colors.placeholder}
              textAlign="center"
              editable={!loading}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.verifyButton,
              (pressed || loading || otpCode.length !== 6) &&
              styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={loading || otpCode.length !== 6}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default VerifyOTPScreen;

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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
  content: {
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  phoneNumberText: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  otpContainer: {
    width: "100%",
    marginBottom: 40,
  },
  otpInput: {
    fontSize: 32,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 10,
    width: "80%",
    alignSelf: "center",
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});
