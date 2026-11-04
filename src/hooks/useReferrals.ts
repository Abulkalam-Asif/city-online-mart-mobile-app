import { useQuery } from "@tanstack/react-query";
import { referralService } from "../services";
import { queryKeys } from "../lib/react-query";

/** The customer's permanent referral code (created by the server the first time it is asked for). */
export function useMyReferralCode(customerId?: string) {
  return useQuery({
    queryKey: [...queryKeys.referrals.code(), customerId ?? ""],
    queryFn: () => referralService.getMyReferralCode(),
    enabled: !!customerId,
    staleTime: Infinity, // the code never changes
  });
}

/** The friends this customer invited and where each one stands. */
export function useMyInvitedFriends(customerId?: string) {
  return useQuery({
    queryKey: queryKeys.referrals.invited(customerId ?? ""),
    queryFn: () => referralService.getMyInvitedFriends(customerId!),
    enabled: !!customerId,
  });
}

/** Who invited this customer (null when nobody did). */
export function useMyInviter(customerId?: string) {
  return useQuery({
    queryKey: queryKeys.referrals.inviter(customerId ?? ""),
    queryFn: () => referralService.getMyInviter(customerId!),
    enabled: !!customerId,
  });
}
