import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import RetryButton from "./RetryButton";
import { theme } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface ErrorBannerProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void; // Required if dismissible - parent controls unmount
}

const ErrorBanner = ({
  title = "Error",
  message = "Something went wrong",
  onRetry,
  onDismiss,
}: ErrorBannerProps) => {
  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Close button (only if dismissible via onDismiss) */}
          {onDismiss && (
            <Pressable style={styles.closeButton} onPress={onDismiss}>
              <Ionicons name="close" size={24} color={"black"} />
            </Pressable>
          )}

          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="alert-circle"
              size={48}
              color={theme.colors.error}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Retry Button */}
          {onRetry && (
            <RetryButton
              onPress={() => {
                onRetry();
                onDismiss?.(); // Also dismiss after retry
              }}
              style={styles.retryButton}
            />
          )}
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
    maxWidth: 320,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: theme.colors.text_secondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 32,
  },
});

export default ErrorBanner;