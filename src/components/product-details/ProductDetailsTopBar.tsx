import { Share, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Entypo, Feather, FontAwesome6 } from "@expo/vector-icons";
import IconButton from "../general/IconButton";
import { useNavigation } from "expo-router";

const ProductDetailsTopBar = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <IconButton
        icon={<FontAwesome6 name="chevron-left" size={24} color={"#000"} />}
        onPress={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.rightSection}>
        <IconButton
          icon={
            <Entypo
              name={isFavorite ? "heart" : "heart-outlined"}
              size={24}
              color={isFavorite ? "red" : "black"}
            />
          }
          onPress={() => setIsFavorite(!isFavorite)}
        />
        <IconButton
          icon={<Feather name="share-2" size={22} />}
          onPress={() => {
            Share.share({
              message: `Check out this product.`,
            });
          }}
        />
      </View>
    </View>
  );
};

export default ProductDetailsTopBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  rightSection: {
    flexDirection: "row",
    gap: 8,
  },
});
