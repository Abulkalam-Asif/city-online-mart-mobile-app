import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services";
import { queryKeys } from "../lib/react-query";

/**
 * Hook to get current authenticated user
 * Calls AuthService which handles mobile-optimized session retrieval
 */
export function useAuthUser() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => authService.getCurrentUserSession(),
    staleTime: Infinity, // Trust the manual updates from AuthContext
  });
}

/**
 * Hook for sending OTP
 */
export function useSendOTP() {
  return useMutation({
    mutationFn: (phoneNumber: string) => authService.sendOTP(phoneNumber),
  });
}

/**
 * Hook for verifying OTP
 */
export function useVerifyOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (otpCode: string) => {
      const result = authService.pendingConfirmation;
      if (!result) throw new Error("No pending verification found. Please try sending the OTP again.");
      return authService.verifyOTP(result, otpCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}

/**
 * Hook for signing in without OTP
 */
export function useSignInWithoutOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumber: string) => authService.signInWithoutOTP(phoneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}

/**
 * Hook for signing out
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      // Clear user data from cache and reset to default
      queryClient.setQueryData(queryKeys.user.profile(), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}
