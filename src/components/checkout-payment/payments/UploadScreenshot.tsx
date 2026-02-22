import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Checkbox } from "expo-checkbox";
import { theme } from "@/src/constants/theme";

type UploadScreenshotProps = {
  isChecked: boolean;
  setChecked: (value: boolean) => void;
  screenshot: string | null;
  setScreenshot: (value: string | null) => void;
};

const UploadScreenshot = ({
  isChecked,
  setChecked,
  screenshot,
  setScreenshot,
}: UploadScreenshotProps) => {
  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setScreenshot(result.assets[0].uri);
    }
  }, [setScreenshot]);

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Please send the payment based on your selected method, click &quot;I
        have made the payment&quot;, and upload a screenshot.
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.checkboxContainer,
          pressed && styles.checkboxContainerPressed,
        ]}
        onPress={() => setChecked(!isChecked)}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={theme.colors.primary}
        />
        <Text style={styles.checkboxLabelText}>I have made the payment</Text>
      </Pressable>

      {screenshot ? (
        <Image source={screenshot} style={styles.image} contentFit="contain" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No screenshot uploaded</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={pickImage}
        activeOpacity={0.8}>
        <Text style={styles.buttonText}>Upload Screenshot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  instructionText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  checkboxContainerPressed: { opacity: 0.6 },
  checkbox: {
    width: 20,
    height: 20,
  },
  checkboxLabelText: { fontSize: 14, fontFamily: theme.fonts.medium },
  image: {
    margin: "auto",
    width: "50%",
    minWidth: 200,
    height: 200,
    borderRadius: 8,
  },
  placeholder: {
    margin: "auto",
    width: "50%",
    minWidth: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#888" },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: "auto",
  },
  buttonText: {
    color: "#fff",
    fontFamily: theme.fonts.medium,
    fontSize: 12,
  },
});

export default UploadScreenshot;
