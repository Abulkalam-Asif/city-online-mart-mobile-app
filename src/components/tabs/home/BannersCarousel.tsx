import { Dimensions, StyleSheet, Text, Pressable, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { CONSTANTS } from "@/src/constants/constants";
import { BannerMinimal } from "@/src/types/banner.types";
import { theme } from "@/src/constants/theme";
import CarouselAnimatedDots from "../../general/CarouselAnimatedDots";
import { useGetHomepageBanners } from "@/src/hooks/useBanners";
import { router } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import Loading from "../../common/Loading";
import React from "react";

const width = Dimensions.get("window").width;

const BannersCarousel = () => {
  const { data: bannersData, isLoading: loadingBannersData, error: errorGettingBanners } =
    useGetHomepageBanners();
  // Calculate card width to show main card fully + partial next card
  const cardWidth = width * 0.85; // Main card takes 85% of screen
  const cardSpacing = 16; // Space between cards

  const progressValue = useSharedValue<number>(0);

  if (loadingBannersData) {
    return <Loading color={"white"} style={{ paddingVertical: 12 }} />;
  }

  // Return null on error OR when no banners exist
  if (errorGettingBanners || !bannersData || bannersData.length === 0) {
    return null;
  }

  const handleBannerPress = (popupBanner: BannerMinimal) => {
    if (popupBanner.linkType === "product") {
      router.push(`/product-details?id=${popupBanner.link}`);
    } else if (popupBanner.linkType === "category") {
      router.push(`/categories?categoryId=${popupBanner.link}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitleText}>Find your Best Deals</Text>
      <Carousel
        width={cardWidth}
        height={cardWidth / CONSTANTS.homepageBannerRatio}
        style={{ width: width }}
        autoPlay={true}
        autoPlayInterval={5000}
        data={bannersData}
        mode="parallax"
        onProgressChange={(_, absoluteProgress) => {
          progressValue.value = absoluteProgress;
        }}
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
        }}
        renderItem={({ item }: { item: BannerMinimal; index: number }) => (
          <Pressable
            style={[styles.imageContainer, { width: cardWidth - cardSpacing }]}
            onPress={() => handleBannerPress(item)}>
            <Image source={item.imageUrl} style={styles.image} />
          </Pressable>
        )}
      />
      <CarouselAnimatedDots
        bannersCount={bannersData.length}
        progressValue={progressValue}
        horizontalPosition="flex-start"
      />
    </View>
  );
};

export default React.memo(BannersCarousel);

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitleText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 20,
    color: "#fff",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: width * 0.025,
  },
});
