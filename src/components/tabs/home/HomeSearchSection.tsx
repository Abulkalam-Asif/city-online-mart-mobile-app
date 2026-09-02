import { Pressable, StyleSheet, TextInput, View, Dimensions, Keyboard } from "react-native";
import React, { useState, useEffect } from "react";
import { theme } from "@/src/constants/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import SearchDropdown from "./SearchDropdown";

const { height: screenHeight } = Dimensions.get("window");

type HomeSearchSectionProps = {
  openSidebarHandler: () => void;
};

const HomeSearchSection: React.FC<HomeSearchSectionProps> = ({
  openSidebarHandler,
}: HomeSearchSectionProps) => {
  const [inputText, setInputText] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce the search term to avoid excessive queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(inputText);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [inputText]);

  const handleDismiss = () => {
    Keyboard.dismiss();
    setInputText("");
    setDebouncedSearchTerm("");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
          onPress={openSidebarHandler}>
          <FontAwesome6 name="bars" size={20} color={"#fff"} />
        </Pressable>
        <TextInput
          placeholder="Search your product"
          style={styles.textInput}
          placeholderTextColor={theme.colors.placeholder}
          value={inputText}
          onChangeText={setInputText}
          returnKeyType="search"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="none"
        />
        <Pressable
          style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}>
          <FontAwesome6 name="bell" size={20} color={"#fff"} />
        </Pressable>
      </View>

      {/* Invisible overlay to dismiss search when clicking outside */}
      {debouncedSearchTerm.trim().length > 0 && (
        <Pressable style={styles.overlay} onPress={handleDismiss} />
      )}

      {/* Dropdown for search results */}
      {debouncedSearchTerm.trim().length > 0 && (
        <SearchDropdown searchTerm={debouncedSearchTerm} />
      )}
    </View>
  );
};

export default HomeSearchSection;

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 1000,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  textInput: {
    backgroundColor: theme.colors.background_3,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  overlay: {
    position: "absolute",
    top: 55, // Start right below the search bar
    left: 0,
    right: 0,
    bottom: -screenHeight, // Stretch far down the screen
    zIndex: 999,
  },
});
