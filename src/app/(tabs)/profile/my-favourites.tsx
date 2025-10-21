import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import { tempCartItems } from "@/temp/home/products/tempCartItems";
import { theme } from "@/src/constants/theme";
import FavouriteItem from "@/src/components/tabs/profile/my-favourites/FavouriteItem";

const MyFavouritesScreen = () => {
  const favourites = tempCartItems;

  return (
    <View style={styles.container}>
      <GeneralTopBar text="My Favourites" />
      <View style={styles.infoContainer}>
        <Text style={styles.itemsCountText}>{favourites.length} items</Text>
      </View>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        data={favourites}
        renderItem={({ item }) => <FavouriteItem item={item} />}
        keyExtractor={(item) => item.Id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MyFavouritesScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  containerContent: {
    paddingBottom: 100,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  itemsCountText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
});
