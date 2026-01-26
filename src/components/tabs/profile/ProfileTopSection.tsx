import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/AuthContext";

const ProfileTopSection = () => {
  const { user } = useAuth();
  // const [screenshot, setScreenshot] = useState<string | null>(null);

  // const uploadImage = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ["images"],
  //     quality: 1,
  //   });

  //   if (!result.canceled && result.assets && result.assets.length > 0) {
  //     setScreenshot(result.assets[0].uri);
  //   }
  // };

  return (
    <View style={styles.container}>
      {/* <View style={styles.profileImageContainer}>
        <View style={styles.profileImageWrapper}>
          {screenshot ? (
            <Image
              source={screenshot}
              style={styles.profileImage}
              contentFit="cover"
            />
          ) : (
            <Image
              source={require("@/src/assets/profile-image-placeholder.png")}
              style={styles.profileImage}
              contentFit="cover"
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.editIconButton}
          onPress={uploadImage}
          activeOpacity={0.8}>
          <Feather name="edit-2" size={16} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View> */}
      {user?.displayName && (
        <Text style={styles.username}>{user.displayName}</Text>
      )}
      <Text style={styles.phoneNumber}>{user?.phoneNumber}</Text>
    </View>
  );
};

export default ProfileTopSection;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  // profileImageContainer: {
  //   position: "relative",
  //   marginBottom: 8,
  // },
  // profileImageWrapper: {
  //   width: 110,
  //   height: 110,
  //   borderRadius: 60,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   overflow: "hidden",
  // },
  // profileImage: {
  //   width: "100%",
  //   height: "100%",
  // },
  // editIconButton: {
  //   position: "absolute",
  //   top: 0,
  //   right: 0,
  //   width: 32,
  //   height: 32,
  //   borderRadius: 16,
  //   backgroundColor: "#fff",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   shadowColor: "#000",
  //   shadowOffset: {
  //     width: 0,
  //     height: 2,
  //   },
  //   shadowOpacity: 0.15,
  //   shadowRadius: 3,
  //   elevation: 3,
  // },
  username: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  phoneNumber: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.text,
  },
});
