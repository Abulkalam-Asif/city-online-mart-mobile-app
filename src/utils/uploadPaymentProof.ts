import { getStorage, ref, uploadBytes, getDownloadURL } from "@react-native-firebase/storage";

/**
 * Upload payment proof image to Firebase Storage and return the download URL.
 * @param imageUri - Local file URI from the image picker (e.g., file://...)
 * @param pathPrefix - A prefix for the storage path (e.g., orderId or a temp key)
 * @returns Promise<string> - The Firebase Storage download URL
 */
export const uploadPaymentProof = async (
  imageUri: string,
  pathPrefix: string
): Promise<string> => {
  try {
    const storage = getStorage();

    // Convert file:// URI to a blob (React Native / Expo specific)
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Derive extension from the URI
    const uriParts = imageUri.split(".");
    const extension = uriParts.length > 1 ? uriParts[uriParts.length - 1] : "jpg";

    const timestamp = Date.now();
    const storagePath = `ORDERS/${pathPrefix}/payment-proof/${timestamp}.${extension}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    console.log("Payment proof uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    throw new Error("Failed to upload payment proof image");
  }
};