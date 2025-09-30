import { Dimensions, StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";
import Carousel from "react-native-reanimated-carousel";
import { IProductImage } from "@/src/types";
import { Image } from "expo-image";
import CarouselAnimatedDots from "../general/CarouselAnimatedDots";

type ImagesCarouselProps = {
  images: IProductImage[];
};

const { width } = Dimensions.get("window");

const ImagesCarousel = ({ images }: ImagesCarouselProps) => {
  const cardWidth = width;

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  return (
    <>
      <View>
        <Carousel
          ref={carouselRef}
          width={cardWidth}
          height={250}
          style={{ width: width }}
          autoPlay={true}
          autoPlayInterval={10000}
          onSnapToItem={(index) => setCurrentIndex(index)}
          data={images || []}
          renderItem={({ item }: { item: IProductImage; index: number }) => (
            <View style={styles.imageContainer}>
              <Image
                source={item.ImageUrl}
                style={[styles.productImage]}
                contentFit="cover"
              />
            </View>
          )}
        />
        <CarouselAnimatedDots
          bannersCount={images.length}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          horizontalPosition="center"
          carouselRef={carouselRef}
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
