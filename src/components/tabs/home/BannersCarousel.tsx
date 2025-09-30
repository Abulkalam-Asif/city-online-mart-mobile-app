import { Dimensions, StyleSheet, Text, Pressable, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { CONSTANTS } from "@/src/constants/contants";
// import { useActiveSlideBanners } from "@/src/hooks/useBanners";
import { IBanner } from "@/src/types/banner";
import { theme } from "@/src/constants/theme";
import { useRef, useState } from "react";
import CarouselAnimatedDots from "../../general/CarouselAnimatedDots";
import { tempBanners } from "@/temp/home/banners/tempBanners";

const width = Dimensions.get("window").width;

const BannersCarousel = () => {
  // const { data: bannersData, isLoading: loadingBannersData } = useActiveSlideBanners();
  const bannersData = tempBanners;
  // Calculate card width to show main card fully + partial next card
  const cardWidth = width * 0.85; // Main card takes 85% of screen
  const cardSpacing = 16; // Space between cards

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  // if (loadingBannersData) {
  //   return <Text>Loading banners...</Text>;
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitleText}>Find your Best Deals</Text>
      <Carousel
        width={cardWidth}
        ref={carouselRef}
        height={cardWidth / CONSTANTS.home_banner_ratio}
        style={{ width: width }}
        autoPlay={true}
        autoPlayInterval={5000}
        data={bannersData || []}
        mode="parallax"
        onSnapToItem={(index) => setCurrentIndex(index)}
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
        }}
        renderItem={({ item }: { item: IBanner; index: number }) => (
          <Pressable
            style={[styles.imageContainer, { width: cardWidth - cardSpacing }]}>
            <Image source={item.PictureUrl} style={styles.image} />
          </Pressable>
        )}
      />
      <CarouselAnimatedDots
        bannersCount={bannersData ? bannersData.length : 0}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        carouselRef={carouselRef}
        horizontalPosition="flex-start"
      />
    </View>
  );
};

export default BannersCarousel;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitleText: {
    fontFamily: theme.fonts.semi_bold,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
