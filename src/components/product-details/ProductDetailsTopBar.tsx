import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Entypo, Feather, FontAwesome6 } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { formatPrice } from "@/src/utils/formatPrice";
import IconButton from "../general/IconButton";
import { router } from "expo-router";
import { useFavourites } from "@/src/hooks/useFavourites";

type Props = {
  productId: string;
  productName: string;
  price: number; // price the customer pays now (after the best discount)
};

const ProductDetailsTopBar = ({ productId, productName, price }: Props) => {
  const { isFavourite, toggleFavourite } = useFavourites();
  const isFav = isFavourite(productId);

  return (
    <View style={styles.container}>
      <IconButton
        icon={<FontAwesome6 name="chevron-left" size={24} color={"#000"} />}
        onPress={() => {
          router.back();
        }}
      />
      <View style={styles.rightSection}>
        <Pressable
          style={({ pressed }) => [
            styles.favouriteButton,
            pressed && styles.favouriteButtonPressed,
          ]}
          onPress={() => toggleFavourite.mutate(productId)}>
          <Entypo
            name={isFav ? "heart" : "heart-outlined"}
            size={20}
            color={isFav ? "red" : "black"}
          />
          <Text style={styles.favouriteText}>
            {isFav ? "Added to favourite" : "Add to favourite"}
          </Text>
        </Pressable>
        <IconButton
          icon={<Feather name="share-2" size={22} />}
          onPress={() => {
            // No app link yet (B-047): add it here once there is a store page to point to
            Share.share({
              message: `Check out ${productName} for Rs. ${formatPrice(price)} on City Online Mart.`,
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
    alignItems: "center",
    gap: 8,
  },
  favouriteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  favouriteButtonPressed: {
    opacity: 0.8,
  },
  favouriteText: {
    fontSize: 13,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
});
