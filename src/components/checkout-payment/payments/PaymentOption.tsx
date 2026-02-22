import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect } from "react";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { theme } from "@/src/constants/theme";
import UploadScreenshot from "./UploadScreenshot";

type PaymentOptionProps = {
  name: string;
  image: string;
  selectedMethod: string;
  onSelect: (method: string) => void;
  children?: React.ReactNode;
  screenshotRequired: boolean;
  isChecked: boolean;
  setChecked: (checked: boolean) => void;
  screenshot: string | null;
  setScreenshot: (screenshot: string | null) => void;
};

// Large enough ceiling for any payment method's content
const MAX_CONTENT_HEIGHT = 500;

const PaymentOption = ({
  name,
  image,
  selectedMethod,
  onSelect,
  children,
  screenshotRequired,
  isChecked,
  setChecked,
  screenshot,
  setScreenshot,
}: PaymentOptionProps) => {
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
    const maxHeight = interpolate(heightValue.value, [0, 1], [0, MAX_CONTENT_HEIGHT]);

    return {
      opacity,
      maxHeight,
      overflow: "hidden",
    };
  });

  const handlePress = useCallback(() => {
    if (!isSelected) {
      onSelect(name);
    } else {
      onSelect("");
    }
  }, [isSelected, onSelect, name])

  return (
    <View>
      <Pressable
        style={[styles.button, isSelected && styles.buttonSelected]}
        onPress={handlePress}>
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
          {screenshotRequired && selectedMethod === name && (
            <UploadScreenshot
              isChecked={isChecked}
              setChecked={setChecked}
              screenshot={screenshot}
              setScreenshot={setScreenshot}
            />
          )}
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
    borderWidth: 1,
    borderColor: theme.colors.background,
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  buttonSelected: {
    backgroundColor: theme.colors.primary_light,
    borderColor: theme.colors.primary,
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
