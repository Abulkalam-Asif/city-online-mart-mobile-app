import React, { useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Linking,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { CONSTANTS } from "@/src/constants/constants";

type WhatsAppPaymentSectionProps = {
  orderId: string;
  totalAmount?: number;
  paymentMethodName?: string;
  isChecked: boolean;
  setChecked: (value: boolean) => void;
};

const WhatsAppPaymentSection = ({
  orderId,
  totalAmount,
  paymentMethodName,
  isChecked,
  setChecked,
}: WhatsAppPaymentSectionProps) => {
  const whatsappNumber = CONSTANTS.whatsappNumber || "923197303810";

  const handleOpenWhatsApp = useCallback(() => {
    let msg = `Hi City Online Mart! I have placed Order #${orderId}`;
    if (totalAmount) {
      msg += ` (Total: Rs. ${totalAmount})`;
    }
    if (paymentMethodName) {
      msg += ` paid via ${paymentMethodName}`;
    }
    msg += `. Here is my payment screenshot:`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open WhatsApp URL:", err);
    });
  }, [orderId, totalAmount, paymentMethodName, whatsappNumber]);

  return (
    <View style={styles.cardContainer}>
      {/* Verification Badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.stepBadge}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#15803D" />
          <Text style={styles.stepBadgeText}>QUICK VERIFICATION</Text>
        </View>
      </View>

      {/* Instruction */}
      <Text style={styles.instructionText}>
        Please send the payment using your selected method, then tap below to share your payment proof screenshot with us on WhatsApp.
      </Text>

      {/* Prominent WhatsApp CTA Button */}
      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={handleOpenWhatsApp}
        activeOpacity={0.82}>
        <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
        <Text style={styles.whatsappButtonText}>
          Share Screenshot
        </Text>
      </TouchableOpacity>

      {/* Checkbox Option Row */}
      <Pressable
        style={({ pressed }) => [
          styles.checkboxRow,
          isChecked && styles.checkboxRowChecked,
          pressed && styles.checkboxRowPressed,
        ]}
        onPress={() => setChecked(!isChecked)}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? "#25D366" : theme.colors.primary}
        />
        <Text style={[styles.checkboxLabelText, isChecked && styles.checkboxLabelTextChecked]}>
          I have sent payment proof on WhatsApp
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    gap: 14,
    backgroundColor: "#F4FBF7",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  badgeContainer: {
    flexDirection: "row",
  },
  stepBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepBadgeText: {
    fontSize: 11,
    fontFamily: theme.fonts.bold,
    color: "#15803D",
    letterSpacing: 0.5,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: "#374151",
    lineHeight: 19,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checkboxRowChecked: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  checkboxRowPressed: {
    opacity: 0.75,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  checkboxLabelText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: "#4B5563",
    flexShrink: 1,
  },
  checkboxLabelTextChecked: {
    color: "#065F46",
    fontFamily: theme.fonts.semibold,
  },
});

export default WhatsAppPaymentSection;
