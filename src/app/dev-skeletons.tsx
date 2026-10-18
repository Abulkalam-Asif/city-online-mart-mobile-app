import { ScrollView, StyleSheet, Text } from "react-native";
import React from "react";
import { Redirect } from "expo-router";
import { theme } from "@/src/constants/theme";
import HomeTopBg from "@/src/components/tabs/home/HomeTopBg";
import HomeSearchSection from "@/src/components/tabs/home/HomeSearchSection";
import {
  BannersSkeleton,
  CategoriesSkeleton,
  ProductsSectionSkeleton,
} from "@/src/components/tabs/home/HomeSkeletons";

/**
 * Developer preview: every home skeleton in the real home layout, no data needed.
 * Open it with:
 *   adb shell am start -a android.intent.action.VIEW -d "cityonlinemart://dev-skeletons" com.cityonlinemart.com
 * Release builds redirect to the home screen, so customers never see it.
 */
const DevSkeletonsScreen = () => {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HomeTopBg />
      <HomeSearchSection openSidebarHandler={() => {}} />
      <BannersSkeleton />
      <CategoriesSkeleton />
      <ProductsSectionSkeleton colorIndex={0} />
      <ProductsSectionSkeleton colorIndex={1} />
      <Text style={styles.caption}>Skeleton preview (development builds only)</Text>
    </ScrollView>
  );
};

export default DevSkeletonsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  caption: {
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    fontSize: 11,
    color: theme.colors.text_secondary,
    marginTop: 16,
  },
});
