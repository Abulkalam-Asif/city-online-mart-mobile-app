import { getAuth, connectAuthEmulator } from "@react-native-firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "@react-native-firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "@react-native-firebase/functions";
import { getStorage, connectStorageEmulator } from "@react-native-firebase/storage";


// Initialize Firebase services
export const auth = getAuth();

export const db = getFirestore();

export const storage = getStorage();

export const functions = getFunctions();

// Connect to Firebase Emulators in development
const USE_EMULATOR = false;

// For React Native:
// - iOS Simulator: use "localhost" or "127.0.0.1"
// - Android Emulator: use "10.0.2.2" (special alias for host machine's localhost)
// - Physical Device: use your computer's local IP address (e.g., "192.168.1.x")
// const EMULATOR_HOST = "10.0.2.2";
const EMULATOR_HOST = "192.168.1.6";

const isEmulatorConnected = {
  auth: false,
  firestore: false,
  storage: false,
  functions: false,
};

if (USE_EMULATOR) {

  // Connect Auth Emulator
  if (!isEmulatorConnected.auth) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, {
      disableWarnings: true,
    });
    isEmulatorConnected.auth = true;
    console.log(`🔧 Connected to Auth Emulator at ${EMULATOR_HOST}:9099`);
  }

  // Connect Firestore Emulator
  if (!isEmulatorConnected.firestore) {
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
    isEmulatorConnected.firestore = true;
    console.log(`🔧 Connected to Firestore Emulator at ${EMULATOR_HOST}:8080`);
  }

  // Connect Storage Emulator
  if (!isEmulatorConnected.storage) {
    connectStorageEmulator(storage, EMULATOR_HOST, 9199);
    isEmulatorConnected.storage = true;
    console.log(`🔧 Connected to Storage Emulator at ${EMULATOR_HOST}:9199`);
  }

  // Connect Functions Emulator
  if (!isEmulatorConnected.functions) {
    connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
    isEmulatorConnected.functions = true;
    console.log(`🔧 Connected to Functions Emulator at ${EMULATOR_HOST}:5001`);
  }
}

// Utility function to convert localhost URLs to work with Android emulator
export const convertEmulatorUrl = (url: string): string => {
  if (!url || !USE_EMULATOR) return url;

  // Replace localhost with the emulator host for Android
  return url.replace("localhost", EMULATOR_HOST);
};