import { Pressable, StyleSheet, View, TextInput, Dimensions, Keyboard } from "react-native";
import React, { useState, useEffect } from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { router } from "expo-router";
import SearchDropdown from "../home/SearchDropdown";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

const { height: screenHeight } = Dimensions.get("window");

type CategoriesHeaderProps = {
  currentCategoryName: string;
};

const CategoriesHeader = ({ currentCategoryName }: CategoriesHeaderProps) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputText, setInputText] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce the search term to avoid excessive queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(inputText);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [inputText]);

  const toggleSearch = () => {
    if (isSearchActive) {
      setIsSearchActive(false);
      setInputText("");
      setDebouncedSearchTerm("");
      Keyboard.dismiss();
    } else {
      setIsSearchActive(true);
    }
  };

  const handleDismiss = () => {
    toggleSearch();
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View layout={LinearTransition} style={styles.container}>
        <Animated.View layout={LinearTransition}>
          <Pressable
            style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
            onPress={() => {
              if (isSearchActive) {
                toggleSearch();
              } else {
                router.back();
              }
            }}>
            <FontAwesome6 name="chevron-left" size={20} />
          </Pressable>
        </Animated.View>

        {isSearchActive ? (
          <Animated.View
            style={styles.searchBarWrapper}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition}
          >
            <TextInput
              placeholder="Search all products..."
              style={styles.textInput}
              placeholderTextColor={theme.colors.placeholder}
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="search"
              autoCorrect={false}
              spellCheck={false}
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
            />
          </Animated.View>
        ) : (
          <Animated.Text
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition}
            style={styles.categoryNameText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {currentCategoryName}
          </Animated.Text>
        )}

        {!isSearchActive && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition}
          >
            <Pressable
              style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
              onPress={toggleSearch}>
              <FontAwesome6 name="magnifying-glass" size={20} />
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>

      {/* Invisible overlay to dismiss search when clicking outside */}
      {isSearchActive && (
        <Pressable style={styles.overlay} onPress={handleDismiss} />
      )}

      {/* Dropdown for search results */}
      {isSearchActive && debouncedSearchTerm.trim().length > 0 && (
        <SearchDropdown searchTerm={debouncedSearchTerm} />
      )}
    </View>
  );
};

export default CategoriesHeader;

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 1000,
  },
  container: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 2,
  },
  categoryNameText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 22,
    flex: 1,
    textAlign: "center",
  },
  searchBarWrapper: {
    flex: 1,
  },
  textInput: {
    backgroundColor: theme.colors.background_3,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    marginRight: 16, // to replace the space of the search icon
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  overlay: {
    position: "absolute",
    top: 70, // Start right below the header
    left: 0,
    right: 0,
    bottom: -screenHeight, // Stretch far down the screen
    zIndex: 999,
  },
});
