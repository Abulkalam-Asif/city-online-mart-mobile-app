import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Redirect } from "expo-router";
import EmptyState from "@/src/components/common/EmptyState";
import { SearchResultsSkeleton } from "@/src/components/tabs/home/SearchDropdown";
import { theme } from "@/src/constants/theme";
import HomeTopBg from "@/src/components/tabs/home/HomeTopBg";
import HomeSearchSection from "@/src/components/tabs/home/HomeSearchSection";
import { CategoriesScreenSkeleton } from "@/src/components/tabs/categories/CategoriesSkeletons";
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
      <Text style={styles.sectionLabel}>Categories tab (loading)</Text>
      <CategoriesScreenSkeleton />
      <Text style={styles.sectionLabel}>Search results (loading)</Text>
      <View style={styles.card}>
        <SearchResultsSkeleton />
      </View>
      <Text style={styles.sectionLabel}>Search: nothing found</Text>
      <View style={styles.card}>
        <EmptyState
          compact
          icon="search-outline"
          title="No products found"
          message={'Nothing matches "abc". Try a different word.'}
        />
      </View>
      <Text style={styles.sectionLabel}>Search: failed</Text>
      <View style={styles.card}>
        <EmptyState
          compact
          tone="error"
          title="Search failed"
          message="Please check your connection and try again."
          actionText="Retry"
          onAction={() => {}}
        />
      </View>
      <Text style={styles.sectionLabel}>Home: could not load</Text>
      <EmptyState
        tone="error"
        title="Couldn't load products"
        message="Please check your internet connection and try again."
        actionText="Retry"
        onAction={() => {}}
      />
      <Text style={styles.sectionLabel}>Categories tab: no products</Text>
      <EmptyState
        icon="basket-outline"
        title="No products here yet"
        message="Products in this category will show up soon. Try another category."
      />
      <Text style={styles.sectionLabel}>Categories tab: products failed</Text>
      <EmptyState
        tone="error"
        title="Couldn't load products"
        message="Please check your internet connection and try again."
        actionText="Retry"
        onAction={() => {}}
      />
      <Text style={styles.sectionLabel}>Categories tab: categories failed</Text>
      <EmptyState
        tone="error"
        title="Couldn't load categories"
        message="Please check your internet connection and try again."
        actionText="Retry"
        onAction={() => {}}
      />
      <Text style={styles.sectionLabel}>Home: store is empty</Text>
      <EmptyState
        icon="storefront-outline"
        title="Products are coming soon"
        message="We are adding products to your city's store. Please check back shortly."
      />
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
  sectionLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.background,
    overflow: "hidden",
  },
  caption: {
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    fontSize: 11,
    color: theme.colors.text_secondary,
    marginTop: 16,
  },
});
