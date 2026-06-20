import { Share, StyleSheet, View } from "react-native";
import React from "react";
import { Entypo, Feather, FontAwesome6 } from "@expo/vector-icons";
import IconButton from "../general/IconButton";
import { router } from "expo-router";
import { useFavourites } from "@/src/hooks/useFavourites";

type Props = {
  productId: string;
};

const ProductDetailsTopBar = ({ productId }: Props) => {
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
        <IconButton
          icon={
            <Entypo
              name={isFav ? "heart" : "heart-outlined"}
              size={24}
              color={isFav ? "red" : "black"}
            />
          }
          onPress={() => toggleFavourite.mutate(productId)}
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
