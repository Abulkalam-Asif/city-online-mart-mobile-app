import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import { useCityContext } from "@/src/contexts/CityContext";
import type { City } from "@/src/contexts/CityContext";

export default function CitySelectScreen() {
  const router = useRouter();
  const { cities, selectedCity, citiesLoading, citiesError, setCity } =
    useCityContext();
  const [selectingCityId, setSelectingCityId] = useState<string | null>(null);

  const handleSelectCity = async (city: City) => {
    setSelectingCityId(city.id);
    try {
      await setCity(city.id);
      router.replace("/login");
    } finally {
      setSelectingCityId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.headerContainer}>
          <Image
            source={require("@/src/assets/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Select Your City</Text>
          <Text style={styles.subtitle}>
            Choose your city to see available products and services
          </Text>
        </View>

        {/* City List */}
        <View style={styles.citiesContainer}>
          {citiesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading cities...</Text>
            </View>
          ) : citiesError ? (
            <View style={styles.errorContainer}>
              <FontAwesome6
                name="circle-exclamation"
                size={32}
                color={theme.colors.error}
              />
              <Text style={styles.errorText}>{citiesError}</Text>
            </View>
          ) : cities.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No cities available yet.</Text>
            </View>
          ) : (
            cities.map((city) => {
              const isSelected = selectedCity?.id === city.id;
              const isSelecting = selectingCityId === city.id;

              return (
                <Pressable
                  key={city.id}
                  style={({ pressed }) => [
                    styles.cityCard,
                    isSelected && styles.cityCardSelected,
                    (pressed || isSelecting) && styles.cityCardPressed,
                  ]}
                  onPress={() => handleSelectCity(city)}
                  disabled={!!selectingCityId}>

                  <View style={styles.cityCardLeft}>
                    <View
                      style={[
                        styles.cityIcon,
                        isSelected && styles.cityIconSelected,
                      ]}>
                      <FontAwesome6
                        name="location-dot"
                        size={18}
                        color={
                          isSelected ? "#fff" : theme.colors.primary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.cityName,
                        isSelected && styles.cityNameSelected,
                      ]}>
                      {city.name}
                    </Text>
                  </View>

                  {isSelecting ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        isSelected ? "#fff" : theme.colors.primary
                      }
                    />
                  ) : isSelected ? (
                    <FontAwesome6
                      name="circle-check"
                      size={20}
                      color="#fff"
                    />
                  ) : (
                    <FontAwesome6
                      name="chevron-right"
                      size={14}
                      color={theme.colors.placeholder}
                    />
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          You can change your city later from the settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  headerContainer: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 36,
  },
  logo: {
    width: 160,
    height: 60,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },

  // Cities
  citiesContainer: {
    gap: 12,
  },
  cityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.background,
    backgroundColor: "#fff",
  },
  cityCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  cityCardPressed: {
    opacity: 0.75,
  },
  cityCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary_light,
    alignItems: "center",
    justifyContent: "center",
  },
  cityIconSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cityName: {
    fontSize: 15,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  cityNameSelected: {
    color: "#fff",
  },

  // Loading / Error
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.error,
    textAlign: "center",
  },

  // Footer
  footerNote: {
    marginTop: 32,
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.placeholder,
    textAlign: "center",
  },
});
