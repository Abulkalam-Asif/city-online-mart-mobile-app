import { StyleSheet, Text, Pressable, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { getResponsiveValue } from "@/src/utils/getResponsiveValue";
import { router } from "expo-router";

type CategoryCardProps = {
  id: string;
  name: string;
  imageSource?: string;
  backgroundColor?: string;
};

const CategoryCard = ({
  id,
  imageSource,
  name,
  backgroundColor,
}: CategoryCardProps) => {
  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/categories",
          params: {
            categoryId: id,
          },
        });
      }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.imageContainer, { backgroundColor }]}>
        <Image
          source={
            imageSource
              ? { uri: imageSource }
              : require("@/src/assets/default-image.png")
          }
          style={styles.image}
          contentFit="contain"
        />
      </View>
      <Text style={styles.nameText} numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    height: getResponsiveValue<number>(105, 200),
  },
  cardPressed: {
    opacity: 0.7,
  },
  imageContainer: {
    borderRadius: 16,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  nameText: {
    fontSize: getResponsiveValue<number>(8, 12),
    lineHeight: getResponsiveValue<number>(12, 16),
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    textAlign: "center",
  },
});
