import { Dimensions } from "react-native";

export const getResponsiveValue = <T>(
  mobileValue: T | ((width: number) => T),
  tabletValue: T | ((width: number) => T)
): T => {
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;

  const value = isTablet ? tabletValue : mobileValue;

  // If it's a function, call it with width
  return typeof value === "function"
    ? (value as (width: number) => T)(width)
    : (value as T);
};
