import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

/**
 * Upload payment proof image to Firebase Storage and return download URL
 * @param imageUri - Local file URI (file://...)
 * @param orderId - Order ID for organizing storage path
 * @returns Promise<string> - Download URL from Firebase Storage
 */
export const uploadPaymentProof = async (imageUri: string, orderId: string): Promise<string> => {
  try {
    const storage = getStorage();

    // Convert file:// URI to blob (React Native/Expo specific)
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create storage reference with organized path
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const storagePath = `ORDERS/${orderId}/payment-proof/${timestamp}.${extension}`;
    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    console.log('Payment proof uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    throw new Error('Failed to upload payment proof image');
  }
};

/**
 * Update order document with payment proof URL
 * @param orderId - Order ID
 * @param downloadUrl - Firebase Storage download URL
 */
export const updateOrderWithPaymentProof = async (orderId: string, downloadUrl: string): Promise<void> => {
  try {
    const orderRef = doc(db, 'ORDERS', orderId);
    await updateDoc(orderRef, {
      proofOfPaymentUrl: downloadUrl
    });
    console.log('Order updated with payment proof URL');
  } catch (error) {
    console.error('Error updating order with payment proof:', error);
    throw error;
  }
};