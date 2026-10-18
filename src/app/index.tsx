import { Redirect } from "expo-router";
import { useCityContext } from "@/src/contexts/CityContext";
import AppStartScreen from "@/src/components/common/AppStartScreen";

export default function Index() {
  const { isCityReady, citiesLoading } = useCityContext();

  // Wait until city status is resolved (AsyncStorage + Hub fetch). The native splash normally
  // covers this (SplashGate); this is the fallback if it takes very long.
  if (citiesLoading) {
    return <AppStartScreen />;
  }

  // No city selected → city selection screen
  if (!isCityReady) {
    return <Redirect href={"/city-select" as any} />;
  }

  // City selected → home
  return <Redirect href="/home" />;
}
