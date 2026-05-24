import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSubmitPaymentProof } from "@/src/hooks/useOrders";

interface PaymentProofModalProps {
  visible: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentProofModal = ({
  visible,
  orderId,
  onClose,
  onSuccess,
}: PaymentProofModalProps) => {
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const { mutateAsync: submitProof, isPending } = useSubmitPaymentProof();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!screenshotUri) return;
    try {
      await submitProof({ orderId, imageUri: screenshotUri });
      onSuccess();
    } catch (error) {
      console.error("Failed to submit payment proof", error);
      // Let the parent component handle error display or just handle locally.
      // Usually, react-query or a global toast handles this, but we log for now.
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setScreenshotUri(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Submit Payment Proof</Text>
            {!isPending && (
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text_secondary} />
              </Pressable>
            )}
          </View>

          <Text style={styles.message}>
            Please upload a screenshot of your successful payment transaction for order #{orderId}.
          </Text>

          {screenshotUri ? (
            <View style={styles.previewContainer}>
              <Image source={screenshotUri} style={styles.image} contentFit="contain" />
              {!isPending && (
                <Pressable style={styles.changeImageBtn} onPress={pickImage}>
                  <Text style={styles.changeImageText}>Change Image</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable style={styles.placeholder} onPress={pickImage}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
              <Text style={styles.placeholderText}>Tap to select from gallery</Text>
            </Pressable>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              disabled={isPending}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && !isPending && styles.cancelButtonPressed,
                isPending && styles.buttonDisabled,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              disabled={!screenshotUri || isPending}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.colors.primary },
                (pressed || !screenshotUri) && { opacity: 0.8 },
                (!screenshotUri || isPending) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Submit Proof</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
    marginRight: -4,
  },
  message: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  changeImageBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  changeImageText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },
  placeholder: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  placeholderText: {
    marginTop: 12,
    color: "#888",
    fontFamily: theme.fonts.medium,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonPressed: {
    backgroundColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text_secondary,
  },
  confirmButtonText: {
    fontSize: 15,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
});

export default PaymentProofModal;
