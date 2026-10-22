import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import EmptyState from "@/src/components/common/EmptyState";
import PrimaryButton from "@/src/components/general/PrimaryButton";
import ScreenFooter from "@/src/components/general/ScreenFooter";

export default function EmptyCart() {
  // The cart is a tab, so jump to the Home tab; push("/") would stack another Home on top.
  const handleStartShopping = () => {
    router.navigate("/home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Looks like you haven't added anything yet"
        />
      </View>

      <ScreenFooter>
        <PrimaryButton label="Start Shopping" onPress={handleStartShopping} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
});
