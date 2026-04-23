import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/src/constants/theme";
// import { tempBrands } from "@/temp/categories/brands/tempBrands";
import { Image } from "expo-image";

type BrandsMenuProps = {
  onApply: (selectedBrands: number[]) => void;
  selectedBrands: number[];
};

const BrandsMenu = ({ onApply, selectedBrands }: BrandsMenuProps) => {
  const [localSelected, setLocalSelected] = React.useState<number[]>(
    selectedBrands.map(Number)
  );

  const handleBrandToggle = (brandId: number) => {
    setLocalSelected((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleApply = () => {
    onApply(localSelected);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandsGrid}>
        {/* {tempBrands.map((brand) => (
          <Pressable
            key={brand.Id}
            style={[
              styles.brandItem,
              localSelected.includes(brand.Id) && styles.selectedBrand,
            ]}
            onPress={() => handleBrandToggle(brand.Id)}>
            <Image source={brand.Image} style={styles.brandCircle} />
          </Pressable>
        ))} */}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.applyButton,
          pressed && styles.applyButtonPressed,
        ]}
        onPress={handleApply}>
        <Text style={styles.applyButtonText}>Apply</Text>
      </Pressable>
    </View>
  );
};

export default BrandsMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 16,
  },
  brandItem: {
    width: 56,
    height: 56,
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.background,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBrand: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary_light,
  },
  brandCircle: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: "center",
    marginTop: "auto",
  },
  applyButtonPressed: {
    opacity: 0.8,
  },

  applyButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },
});
