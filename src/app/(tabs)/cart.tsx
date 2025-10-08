import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import CartItem from "@/src/components/tabs/cart/CartItem";
import { tempCartItems } from "@/temp/home/products/tempCartItems";

export default function CartScreen() {
  const cartItems = tempCartItems;

  return (
    <View style={styles.mainContainer}>
      <GeneralTopBar text="My Cart" />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        data={cartItems}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.Id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  containerContent: {
    paddingVertical: 20,
    gap: 16,
  },
});
