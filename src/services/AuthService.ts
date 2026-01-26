import {
  getIdTokenResult,
  signInWithCustomToken,
  signInWithPhoneNumber,
  signOut,
  type FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  httpsCallable,
  type Functions,
} from "@react-native-firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser, User, UserRole } from "../types/auth.types";
import { logger } from "../utils/logger";

export class AuthService {
  private static readonly USERS_COLLECTION = "USERS";
  private static readonly AUTH_STORAGE_KEY = "@auth_user";
  private _confirmationResult: FirebaseAuthTypes.ConfirmationResult | null =
    null;

  constructor(
    private auth: FirebaseAuthTypes.Module,
    private db: FirebaseFirestoreTypes.Module,
    private functions: Functions,
  ) { }

  public get authInstance(): FirebaseAuthTypes.Module {
    return this.auth;
  }

  public get pendingConfirmation(): FirebaseAuthTypes.ConfirmationResult | null {
    return this._confirmationResult;
  }

  /**
   * Send OTP to phone number
   * Native SDK automatically handles verification (SafetyNet/Play Integrity)
   * @param phoneNumber Pakistani phone number (e.g. 03001234567)
   */
  async sendOTP(phoneNumber: string): Promise<void> {
    try {
      const e164Phone = this.convertToE164(phoneNumber);

      const confirmation = await signInWithPhoneNumber(this.auth, e164Phone);
      this._confirmationResult = confirmation;
    } catch (error: any) {
      logger.error("sendOTP", error);
      throw error;
    }
  }

  /**
   * Verify OTP and sign in
   * @param confirmationResult Result from sendOTP
   * @param otpCode 6-digit code
   */
  async verifyOTP(
    confirmationResult: FirebaseAuthTypes.ConfirmationResult,
    otpCode: string,
  ): Promise<void> {
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      if (userCredential?.user) {
        await this.syncUserProfile(userCredential.user);
        this._confirmationResult = null;
      }
    } catch (error: any) {
      logger.error("verifyOTP", error);
      throw error;
    }
  }

  /**
   * Login without OTP (custom token approach)
   * @param phoneNumber Pakistani phone number (e.g. 03001234567)
   */
  async signInWithoutOTP(phoneNumber: string): Promise<void> {
    try {
      // Note: In native SDK, we call functions directly on the instance, but httpsCallable is on the module instance we passed
      // functions is invoked like functions().httpsCallable(...)
      // But in our constructor we passed 'functions' which is likely the initialized module, e.g. functions("us-central1")

      const generateToken = httpsCallable(
        this.functions,
        "mobileGenerateCustomToken",
      );

      const result = await generateToken({ phoneNumber });
      const { token } = result.data as { token: string };

      if (!token) throw new Error("No custom token received");

      const userCredential = await signInWithCustomToken(this.auth, token);
      if (userCredential.user) {
        await this.syncUserProfile(userCredential.user);
      }
    } catch (error: any) {
      logger.error("signInWithoutOTP", error);
      throw new Error(`Login Error: ${error.code} - ${error.message}`);
    }
  }

  /**
   * Sync user profile with Firestore
   */
  private async syncUserProfile(
    firebaseUser: FirebaseAuthTypes.User,
  ): Promise<void> {
    const userRef = doc(
      this.db,
      AuthService.USERS_COLLECTION,
      firebaseUser.uid,
    );
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      });
    } else {
      const newUser: User = {
        phoneNumber: firebaseUser.phoneNumber || "",
        role: "user",
        isActive: true,
        createdAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp,
      };
      await setDoc(userRef, newUser);
    }
  }

  /**
   * Get the current user session
   */
  async getCurrentUserSession(): Promise<AuthUser | null> {
    try {
      // 1. Storage
      const storedUser = await this.getStoredUser();
      if (storedUser) return storedUser;

      // 2. Firebase
      const firebaseUser = this.auth.currentUser;
      if (firebaseUser) {
        return await this.getAuthUser(firebaseUser);
      }

      return null;
    } catch (error) {
      logger.error("getCurrentUserSession", error);
      return null;
    }
  }

  /**
   * Get auth user with role from custom claims
   */
  async getAuthUser(
    firebaseUser: FirebaseAuthTypes.User | null,
    forceRefresh: boolean = false,
  ): Promise<AuthUser | null> {
    if (!firebaseUser) return null;

    try {
      const idTokenResult = await getIdTokenResult(firebaseUser, forceRefresh);
      const claims = idTokenResult?.claims || {};
      const role = (claims.role as UserRole) || "user";

      const userRef = doc(this.db, AuthService.USERS_COLLECTION, firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber || null,
        displayName: userData?.displayName || null,
        role: role,
      };

      await this.setStoredUser(authUser);
      return authUser;
    } catch (error) {
      logger.error("getAuthUser", error);
      return null;
    }
  }

  async setStoredUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(
        AuthService.AUTH_STORAGE_KEY,
        JSON.stringify(user),
      );
    } catch (error) {
      logger.error("setStoredUser", error);
    }
  }

  async getStoredUser(): Promise<AuthUser | null> {
    try {
      const stored = await AsyncStorage.getItem(
        AuthService.AUTH_STORAGE_KEY,
      );
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      logger.error("getStoredUser", error);
      return null;
    }
  }

  async clearStoredUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AuthService.AUTH_STORAGE_KEY);
    } catch (error) {
      logger.error("clearStoredUser", error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.clearStoredUser();
    } catch (error) {
      logger.error("signOut", error);
      throw error;
    }
  }

  private convertToE164(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return `+92${cleaned.substring(1)}`;
    if (cleaned.startsWith("92")) return `+${cleaned}`;
    return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
  }
}
