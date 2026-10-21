import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { theme } from "@/src/constants/theme";

type PlacingOrderModalProps = {
  visible: boolean;
  title?: string;
  message?: string;
};

// Shown while the order is being sent, so the customer sees that something is happening.
// It has no buttons and ignores the Android back button until the request has finished.
const PlacingOrderModal = ({
  visible,
  title = "Placing your order...",
  message = "Please wait a moment and don't close the app.",
}: PlacingOrderModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LottieView
            source={require("@/src/assets/animations/delivery-scooter-green.json")}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default PlacingOrderModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 5,
  },
  animation: {
    width: 168,
    height: 126,
    transform: [{ scaleX: -1 }], // the scooter is drawn facing left; it should face the way it drives
  },
  title: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center",
  },
  message: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
    textAlign: "center",
  },
});
