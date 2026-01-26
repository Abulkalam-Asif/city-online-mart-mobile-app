import React, { createContext, useContext, useEffect } from "react";
import { authService } from "../services";
import { AuthContextType, VerificationResult } from "../types/auth.types";
import {
  useAuthUser,
  useSignInWithoutOTP,
  useSignOut,
} from "../hooks/useAuthUser";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import { logger } from "../utils/logger";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading } = useAuthUser();

  // Mutation hooks
  const signInWithoutOTPMutation = useSignInWithoutOTP();
  const signOutMutation = useSignOut();

  useEffect(() => {
    // Listen for Firebase auth state changes to keep React Query cache in sync
    const unsubscribe = onAuthStateChanged(
      authService.authInstance,
      async (firebaseUser: FirebaseAuthTypes.User | null) => {
        try {
          if (firebaseUser) {
            // Update React Query cache with fresh user data
            const authUser = await authService.getAuthUser(firebaseUser);
            queryClient.setQueryData(queryKeys.user.profile(), authUser);
          } else {
            // Clear cache on sign out
            queryClient.setQueryData(queryKeys.user.profile(), null);
          }
        } catch (error) {
          logger.error("Auth state change listener", error);
        }
      },
    );

    return unsubscribe;
  }, []);

  const signIn = async (phoneNumber: string): Promise<VerificationResult> => {
    // Logic will be implemented in Phase 2 in the login screen
    throw new Error(
      "signIn needs RecaptchaVerifier from UI. Implementation in Phase 2.",
    );
  };

  const signInWithoutOTP = async (phoneNumber: string): Promise<void> => {
    await signInWithoutOTPMutation.mutateAsync(phoneNumber);
  };

  const signOut = async (): Promise<void> => {
    await signOutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        loading,
        isAuthenticated: !!user,
        signIn,
        signInWithoutOTP,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
