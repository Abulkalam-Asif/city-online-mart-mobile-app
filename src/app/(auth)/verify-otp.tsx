import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { theme } from "@/src/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSendOTP, useVerifyOTP } from "@/src/hooks/useAuthUser";
import { FontAwesome6 } from "@expo/vector-icons";
import { authService } from "@/src/services";
import { Image } from "expo-image";
import LoginContentBg from "@/src/components/auth/login/LoginContentBg";
import ErrorBanner from "@/src/components/common/ErrorBanner";
import { getFriendlyErrorMessage } from "@/src/utils/errorUtils";

const RESEND_SECONDS = 30;

const VerifyOTPScreen = () => {
  const router = useRouter();
  const { phoneNumber, redirect } = useLocalSearchParams<{
    phoneNumber: string;
    redirect?: string;
  }>();
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>("Verification Failed");
  const [sessionExpired, setSessionExpired] = useState(false);

  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const verifyOTPMutation = useVerifyOTP();
  const sendOTPMutation = useSendOTP();
  const inputRef = useRef<TextInput>(null);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleResend = async () => {
    if (resendIn > 0 || resending || !phoneNumber) return;
    setResending(true);
    try {
      await sendOTPMutation.mutateAsync(phoneNumber);
      setOtpCode("");
      setResendIn(RESEND_SECONDS);
      inputRef.current?.focus();
    } catch (error: any) {
      setErrorTitle("Could Not Resend");
      setErrorMessage(
        getFriendlyErrorMessage(error, "Unable to send a new code. Please try again.")
      );
    } finally {
      setResending(false);
    }
  };

  // Check for valid session on mount
  useEffect(() => {
    if (!authService.pendingConfirmation) {
      setErrorTitle("Session Expired");
      setErrorMessage("Your verification session has expired. Please log in again.");
      setSessionExpired(true);
    }
  }, []);

  const handleVerify = async (code: string = otpCode) => {
    if (code.length !== 6) {
      return;
    }

    setLoading(true);
    try {
      await verifyOTPMutation.mutateAsync(code);
      // Go back to where the customer came from (e.g. the cart), otherwise home
      router.replace((redirect ?? "/home") as any);
    } catch (error: any) {
      setErrorTitle("Verification Failed");
      setErrorMessage(
        getFriendlyErrorMessage(error, "The verification code entered is incorrect. Please try again.")
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

          <View style={styles.helperRow}>
            {resendIn > 0 ? (
              <Text style={styles.helperText}>Resend code in {resendIn}s</Text>
            ) : (
              <Pressable onPress={handleResend} disabled={resending} hitSlop={8}>
                <Text style={styles.linkText}>
                  {resending ? "Sending..." : "Resend code"}
                </Text>
              </Pressable>
            )}
            <Text style={styles.helperText}>{"  ·  "}</Text>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.linkText}>Change number</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {errorMessage && (
        <ErrorBanner
          title={errorTitle}
          message={errorMessage}
          buttonText="OK"
          onDismiss={() => {
            setErrorMessage(null);
            // An expired session cannot be recovered here: send the customer back to login
            if (sessionExpired) {
              router.replace({
                pathname: "/login",
                params: redirect ? { redirect } : {},
              });
            }
          }}
        />
      )}
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
    minHeight: 48, // keeps the height the same while the spinner shows
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
  },
  linkText: {
    fontSize: 13,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});
