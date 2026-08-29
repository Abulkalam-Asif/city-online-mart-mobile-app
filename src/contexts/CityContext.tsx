/**
 * Mobile App City Context
 *
 * Manages city selection for the mobile app.
 *
 * Responsibilities:
 * 1. Fetches the city list from Hub Firestore (using default native Firebase app).
 * 2. Restores saved city selection from AsyncStorage on launch.
 * 3. Initializes a secondary Firebase app for the selected city (auth + data).
 * 4. Exposes city state and `setCity` / `clearCity` to all consumers.
 *
 * Architecture:
 * - Default native app (google-services.json → Hub) = city list only.
 * - Secondary programmatic app (city config) = phone auth + all Firestore data.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import functions from "@react-native-firebase/functions";
import { logger } from "../utils/logger";
import { setCityFirebaseInstances, clearCityFirebaseInstances } from "../lib/cityFirebase";
import { resetServiceCache } from "../services";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface City {
  id: string;      // Firestore document ID, e.g. "mian-channu"
  name: string;    // Display name, e.g. "Mian Channu"
  active: boolean;
  firebaseConfig: FirebaseConfig;
}

interface CityContextType {
  cities: City[];
  selectedCity: City | null;
  isCityReady: boolean;
  citiesLoading: boolean;
  citiesError: string | null;
  setCity: (cityId: string) => Promise<void>;
  clearCity: () => Promise<void>;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CITY_STORAGE_KEY = "@app_selected_city";

// ── Context ────────────────────────────────────────────────────────────────────

const CityContext = createContext<CityContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isCityReady, setIsCityReady] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  /**
   * Initialize the secondary Firebase app for the given city.
   * The secondary app handles phone auth + all Firestore data for that city.
   */
  const initializeCityFirebase = useCallback(async (city: City): Promise<void> => {
    setIsCityReady(false);
    try {
      const appName = `city-${city.id}`;
      const existingApps = firebase.apps;
      let app = existingApps.find((a) => a.name === appName);
      let isNewApp = false;

      if (!app) {
        isNewApp = true;
        // Fix for RNFirebase crash: must inject synthetic databaseURL if omitted
        const configWithDb = {
          ...city.firebaseConfig,
          databaseURL: `https://${city.firebaseConfig.projectId}.firebaseio.com`,
        };
        app = await firebase.initializeApp(configWithDb, appName);
      }

      const cityDb = firestore(app);
      const cityAuth = auth(app);
      const cityStorage = storage(app);
      const cityFunctions = functions(app);

      const USE_EMULATOR = process.env.EXPO_PUBLIC_USE_EMULATOR === "true";

      if (__DEV__) {
        // Disable native Play Integrity / SafetyNet network check during development
        cityAuth.settings.appVerificationDisabledForTesting = true;
      }

      if (__DEV__ && USE_EMULATOR && isNewApp) {
        try {
          // Android Emulator requires 10.0.2.2 instead of localhost
          const host = "10.0.2.2";
          cityAuth.useEmulator(`http://${host}:9099`);
          cityDb.useEmulator(host, 8080);
          cityStorage.useEmulator(host, 9199);
          // cityFunctions.useEmulator(host, 5001); // Often disabled for Gen 2
          logger.info(`CityContext: Connected to local emulators at ${host}`);
        } catch {
          logger.warn("CityContext", "Emulator connection failed or already connected.");
        }
      }

      setCityFirebaseInstances(
        app,
        cityDb,
        cityAuth,
        cityStorage,
        cityFunctions
      );

      setSelectedCity(city);
      setIsCityReady(true);
    } catch (error: any) {
      logger.error("CityContext.initializeCityFirebase", error);
      setCitiesError(`Failed to connect to ${city.name}. Please try again.`);
    }
  }, []);

  // Fetch cities from Hub Firestore on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true);
        setCitiesError(null);

        // Default native app = Hub Firebase (google-services.json)
        const snapshot = await firestore()
          .collection("CITIES")
          .where("active", "==", true)
          .get();

        const fetchedCities: City[] = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...(doc.data() as Omit<City, "id">),
        }));

        setCities(fetchedCities);

        // If there is exactly ONE active city, auto-select it and skip the selection screen entirely
        if (fetchedCities.length === 1) {
          const onlyCity = fetchedCities[0];
          await AsyncStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(onlyCity));
          await initializeCityFirebase(onlyCity);
          return;
        }

        // Otherwise, restore previously saved city from AsyncStorage
        const savedJson = await AsyncStorage.getItem(CITY_STORAGE_KEY);
        if (savedJson) {
          const saved: City = JSON.parse(savedJson);
          // Verify it's still in the active cities list
          const stillActive = fetchedCities.find((c) => c.id === saved.id);
          if (stillActive) {
            await initializeCityFirebase(stillActive);
          } else {
            // City no longer active — clear storage
            await AsyncStorage.removeItem(CITY_STORAGE_KEY);
          }
        }
      } catch (error: any) {
        logger.error("CityContext.fetchCities", error);
        setCitiesError("Failed to load cities. Please check your connection.");
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [initializeCityFirebase]);

  /**
   * Public API: select a city by ID.
   * Saves to AsyncStorage and initializes the city Firebase app.
   */
  const setCity = useCallback(async (cityId: string): Promise<void> => {
    const city = cities.find((c) => c.id === cityId);
    if (!city) {
      logger.warn("CityContext.setCity", `City "${cityId}" not found`);
      return;
    }

    // Completely wipe all cached React Query data (e.g. Products, Categories)
    // so the new city doesn't accidentally display the old city's data.
    const { queryClient } = await import("../lib/react-query");
    queryClient.clear();
    logger.info("React Query cache cleared for city switch.");

    await AsyncStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(city));
    await initializeCityFirebase(city);
  }, [cities, initializeCityFirebase]);

  /**
   * Clears the selected city (used on city change — triggers re-login).
   */
  const clearCity = useCallback(async (): Promise<void> => {
    await AsyncStorage.removeItem(CITY_STORAGE_KEY);
    clearCityFirebaseInstances();
    resetServiceCache();
    setSelectedCity(null);
    setIsCityReady(false);
  }, []);

  return (
    <CityContext.Provider
      value={{
        cities,
        selectedCity,
        isCityReady,
        citiesLoading,
        citiesError,
        setCity,
        clearCity,
      }}>
      {children}
    </CityContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export const useCityContext = (): CityContextType => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error("useCityContext must be used within a CityProvider");
  }
  return context;
};
