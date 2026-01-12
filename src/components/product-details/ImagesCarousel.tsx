import { Dimensions, StyleSheet, View } from "react-native";
import React from "react";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import CarouselAnimatedDots from "../general/CarouselAnimatedDots";
import { useSharedValue } from "react-native-reanimated";

type ImagesCarouselProps = {
  images: string[];
};

const { width } = Dimensions.get("window");

const ImagesCarousel = ({ images }: ImagesCarouselProps) => {
  const cardWidth = width;

  const progressValue = useSharedValue<number>(0);

  return (
    <>
      <View>
        <Carousel
          width={cardWidth}
          height={250}
          style={{ width: width }}
          autoPlay={true}
          autoPlayInterval={10000}
          onProgressChange={(_, absoluteProgress) => {
            progressValue.value = absoluteProgress;
          }}
          data={images || []}
          renderItem={({ item }: { item: string }) => (
            <View style={styles.imageContainer}>
              <Image
                source={item}
                style={[styles.productImage]}
                contentFit="cover"
              />
            </View>
          )}
        />
        <CarouselAnimatedDots
          bannersCount={images.length}
          horizontalPosition="center"
          progressValue={progressValue}
        />
      </View>
    </>
  );
};

export default ImagesCarousel;

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  productImage: {
    width: 250,
    height: 250,
  },
});
