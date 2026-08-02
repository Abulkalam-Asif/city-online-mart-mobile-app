import React from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { theme } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { format, parse } from "date-fns";
import { formatSlotTimeRange } from "@/src/utils/slotUtils";

export interface SlotInfo {
  date: string;
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  slotStartTimestamp?: number;
  expressDurationMinutes?: number; // Optional: only for fast delivery
}

interface SlotUnavailableModalProps {
  visible: boolean;
  reason: string;
  proposedSlot: SlotInfo | null;
  onAcceptProposed: (slot: SlotInfo) => void;
  onCancel: () => void;
}

export const SlotUnavailableModal: React.FC<SlotUnavailableModalProps> = ({
  visible,
  reason,
  proposedSlot,
  onAcceptProposed,
  onCancel,
}) => {
  const formattedProposedDate = proposedSlot && proposedSlot.date !== "fast"
    ? format(parse(proposedSlot.date, "yyyy-MM-dd", new Date()), "EEEE, d MMMM")
    : "Express (Within 45m)";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={48} color={theme.colors.express} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Delivery Slot Conflict</Text>

          {/* Conflict Reason */}
          <Text style={styles.reasonText}>{reason}</Text>

          {/* Proposed Slot Section */}
          {proposedSlot && (
            <View style={styles.proposedBox}>
              <Text style={styles.proposedHeader}>Suggested Next Available Slot:</Text>
              <Text style={styles.proposedSlotName}>
                {proposedSlot.id === "fast-delivery" ? "⚡ Express Delivery" : proposedSlot.name}
              </Text>
              <Text style={styles.proposedSlotTime}>
                {proposedSlot.id === "fast-delivery"
                  ? "Get it delivered within an hour"
                  : `${formattedProposedDate} (${formatSlotTimeRange(proposedSlot.startTime, proposedSlot.endTime)})`}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {proposedSlot && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.acceptButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => onAcceptProposed(proposedSlot)}
              >
                <Text style={styles.acceptButtonText}>Accept Next Slot & Continue</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  reasonText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  proposedBox: {
    backgroundColor: theme.colors.primary_light,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  proposedHeader: {
    fontSize: 11,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  proposedSlotName: {
    fontSize: 14,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  proposedSlotTime: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
  },
  acceptButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonPressed: {
    backgroundColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text_secondary,
  },
});

export default SlotUnavailableModal;
