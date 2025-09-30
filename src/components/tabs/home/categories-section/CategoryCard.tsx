import { StyleSheet, Text, Pressable, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";

type CategoryCardProps = {
  name: string;
  imageSource: string | undefined;
  backgroundColor?: string;
};

export const CategoryCardLoading = () => {
  return (
    <View style={styles.card}>
      <View style={[styles.imageLoading]} />
      <View style={[styles.textLoading]} />
    </View>
  );
};

const CategoryCard = ({
  imageSource,
  name,
  backgroundColor,
}: CategoryCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.imageContainer, { backgroundColor }]}>
        <Image source={imageSource} style={styles.image} />
      </View>
      <Text style={styles.nameText}>{name}</Text>
    </Pressable>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    width: 90,
    height: 120,
  },
  cardPressed: {
    opacity: 0.7,
  },
  imageContainer: {
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  imageLoading: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    width: 84,
    height: 84,
  },
  textLoading: {
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    width: 60,
    height: 12,
  },
  nameText: {
    fontSize: 12,
    lineHeight: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
});
