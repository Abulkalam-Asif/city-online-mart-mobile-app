import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { theme } from "@/src/constants/theme";
import { Category } from "@/src/types";

type CategoriesNavProps = {
  categories: Category[];
  currentCategoryId: string;
  setCurrentCategoryId: (id: string) => void;
  setCurrentSubCategoryId: (id: string) => void;
  shouldAutoScroll?: React.RefObject<boolean>;
};

const CategoriesNav = ({
  categories,
  currentCategoryId,
  setCurrentCategoryId,
  setCurrentSubCategoryId,
  shouldAutoScroll,
}: CategoriesNavProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemRefs = useRef<{ [key: string]: View | null }>({});

  // Auto-scroll to selected category (only when from deep link)
  useEffect(() => {
    if (
      shouldAutoScroll?.current &&
      currentCategoryId &&
      scrollViewRef.current
    ) {
      const selectedItemRef = itemRefs.current[currentCategoryId];

      if (selectedItemRef) {
        // Small delay to ensure layout is complete
        setTimeout(() => {
          selectedItemRef.measureLayout(
            scrollViewRef.current as any,
            (x, y, width, height) => {
              // Scroll to position the item at the left edge
              // Add small offset (10px) for visual breathing room
              scrollViewRef.current?.scrollTo({
                x: Math.max(0, x - 10),
                animated: true,
              });
            },
            () => {}
          );
        }, 100);
      }
    }
  }, [currentCategoryId, categories, shouldAutoScroll]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {categories.map((category) => (
        <View
          key={category.id}
          ref={(ref) => {
            itemRefs.current[category.id] = ref;
          }}
          collapsable={false}>
          <Pressable
            onPress={() => {
              setCurrentCategoryId(category.id);
              setCurrentSubCategoryId(
                (category.subCategories && category.subCategories[0]?.id) || ""
              );
            }}
            style={({ pressed }) => [
              styles.categoryButton,
              currentCategoryId === category.id &&
                styles.categoryButtonSelected,
              pressed && styles.categoryButtonPressed,
            ]}>
            <Text
              style={[
                styles.categoryNameText,
                currentCategoryId === category.id &&
                  styles.selectedCategoryText,
              ]}>
              {category.name}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
};

export default CategoriesNav;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  containerContent: {
    alignItems: "center",
    flexDirection: "row",
  },

  categoryButton: {
    paddingTop: 4,
    paddingHorizontal: 10,
  },
  categoryButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  categoryButtonPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },

  categoryNameText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text_secondary,
  },
  selectedCategoryText: {
    color: theme.colors.primary,
  },
});
