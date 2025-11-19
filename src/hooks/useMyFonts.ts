import { useFonts } from "@expo-google-fonts/poppins/useFonts";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import {
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function useMyFonts() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  return fontsLoaded;
}
