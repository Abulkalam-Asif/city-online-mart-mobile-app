import { Redirect } from "expo-router";
import { useCityContext } from "@/src/contexts/CityContext";
import { View, ActivityIndicator } from "react-native";
import { theme } from "@/src/constants/theme";

export default function Index() {
  const { isCityReady, citiesLoading } = useCityContext();

  // Wait until city status is resolved (AsyncStorage + Hub fetch)
  if (citiesLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // No city selected → city selection screen
  if (!isCityReady) {
    return <Redirect href={"/city-select" as any} />;
  }

  // City selected → home
  return <Redirect href="/home" />;
}
