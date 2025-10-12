import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { theme } from "@/src/constants/theme";

type Props = {
  name: string;
  image: string;
  selectedMethod: string;
  onSelect: (method: string) => void;
  children?: React.ReactNode;
  contentHeight?: number;
};

const PaymentOption = ({
  name,
  image,
  selectedMethod,
  onSelect,
  children,
  contentHeight = 100,
}: Props) => {
  const isSelected = selectedMethod === name;
  const hasChildren = !!children;

  // Animation values
  const rotationValue = useSharedValue(0);
  const heightValue = useSharedValue(0);

  // Update animations when selection changes
  useEffect(() => {
    if (hasChildren) {
      rotationValue.value = withTiming(isSelected ? 180 : 0, { duration: 300 });
      heightValue.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
    }
  }, [isSelected, hasChildren, rotationValue, heightValue]);

  // Animated styles
  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotationValue.value}deg`,
        },
      ],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(heightValue.value, [0, 1], [0, 1]);
    const height = interpolate(heightValue.value, [0, 1], [0, contentHeight]); // Adjust max height as needed

    return {
      opacity,
      height,
      overflow: "hidden",
    };
  });

  return (
    <View>
      <Pressable
        style={[styles.button, isSelected && styles.buttonSelected]}
        onPress={() => onSelect(name)}>
        <Image source={image} style={styles.image} />
        <Text style={styles.nameText}>{name}</Text>
        {hasChildren && (
          <Animated.View style={[styles.chevronIcon, chevronAnimatedStyle]}>
            <FontAwesome6 name="chevron-down" size={14} color="#000" />
          </Animated.View>
        )}
      </Pressable>
      {hasChildren && (
        <Animated.View style={[styles.childrenContainer, contentAnimatedStyle]}>
          {children}
        </Animated.View>
      )}
    </View>
  );
};

export default PaymentOption;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.background,
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  buttonSelected: {
    backgroundColor: theme.colors.primary_light,
    borderColor: theme.colors.primary,
    // elevation: 4,
  },
  image: { width: 24, height: 24 },
  nameText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  chevronIcon: {
    marginLeft: "auto",
    justifyContent: "center",
    alignItems: "center",
  },

  childrenContainer: {
    marginTop: 8,
  },
});
