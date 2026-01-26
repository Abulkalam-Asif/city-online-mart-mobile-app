import { Timestamp } from "@react-native-firebase/firestore";

/**
 * User roles in the system
 */
export type UserRole = "super-admin" | "admin" | "user";

/**
 * User profile stored in Firestore USERS collection
 */
export interface User {
  uid?: string;
  email?: string; // For admin/super-admin
  phoneNumber?: string; // For mobile users
  role: UserRole;
  displayName?: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean; // For soft delete
}

/**
 * Extended user object with role from custom claims
 */
export interface AuthUser {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  role: UserRole | null;
}

/**
 * Auth context type
 */
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (phoneNumber: string) => Promise<VerificationResult>;
  signInWithoutOTP: (phoneNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Verification result from Firebase Phone Auth
 */
export interface VerificationResult {
  verificationId: string;
  phoneNumber: string; // In Pakistani format: "03xxxxxxxxx"
}

/**
 * Mobile-specific user profile structure
 */
export interface PhoneAuthUser extends Omit<User, 'email'> {
  phoneNumber: string; // Required for mobile users
}
