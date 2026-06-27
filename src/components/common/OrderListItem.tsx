import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { DisplayItem } from "./OrderItemsList";

type OrderListItemProps = {
  item: DisplayItem;
};

const OrderListItem = ({ item }: OrderListItemProps) => {
  return (
    <View style={styles.itemCard}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={item.imageUrl || require('@/src/assets/default-image.png')}
          style={styles.productImage}
          contentFit="contain"
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.productNameText} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.mathText}>
            {item.quantity} x Rs. {item.discountPercentage && item.discountPercentage > 0 ? item.originalPrice : item.unitPrice} =
          </Text>

          {item.discountPercentage && item.discountPercentage > 0 ? (
            <Text style={styles.unitPriceText}>Rs. {(item.originalPrice || 0) * item.quantity}</Text>
          ) : null}

          <Text style={styles.discountedUnitPriceText}>Rs. {item.totalPrice}</Text>

          {item.discountPercentage && item.discountPercentage > 0 ? (
            <Text style={styles.discountTag}>{`${item.discountPercentage}% off`}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default React.memo(OrderListItem);

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productImage: {
    width: 30,
    height: 30,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  productNameText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: "#333",
    lineHeight: 18,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 8,
    rowGap: 4,
  },
  mathText: {
    fontSize: 11,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
  discountedUnitPriceText: {
    fontSize: 13,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
  },
  unitPriceText: {
    fontSize: 11,
    color: "red",
    textDecorationLine: "line-through",
    fontFamily: theme.fonts.regular,
  },
  discountTag: {
    backgroundColor: theme.colors.tag,
    fontSize: 8,
    lineHeight: 16,
    fontFamily: theme.fonts.semibold,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    color: "black",
  },
});
