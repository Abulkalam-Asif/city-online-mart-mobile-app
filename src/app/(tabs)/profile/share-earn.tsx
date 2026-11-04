import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import EmptyState from "@/src/components/common/EmptyState";
import { theme } from "@/src/constants/theme";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { useMyInvitedFriends, useMyInviter, useMyReferralCode } from "@/src/hooks/useReferrals";
import { queryKeys } from "@/src/lib/react-query";
import { referralService } from "@/src/services";
import { buildShareMessage } from "@/src/utils/referralShare";
import type { Referral } from "@/src/types";

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

/** 03001234567 -> 0300 ***4567: an invited friend's number is only partly shown. */
const maskPhone = (phone?: string) => (phone && phone.length >= 8 ? `${phone.slice(0, 4)} ***${phone.slice(-4)}` : "A friend");

const statusText = (r: Referral) =>
  r.status === "successful"
    ? r.rewardCouponCode
      ? `First order delivered · you earned ${r.rewardCouponCode}`
      : "First order delivered"
    : r.status === "void"
      ? "Cancelled"
      : "Waiting for their first order to be delivered";

/**
 * "Share & Earn" (B-063): the customer's referral code, a share button, and the friends they invited.
 * The reward (a referral coupon) is earned when an invited friend's first order is delivered and then
 * appears in My Coupons.
 */
const ShareEarnScreen = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const { data: code, isLoading, isError, refetch } = useMyReferralCode(user?.uid);
  const { data: friends, isRefetching, refetch: refetchFriends } = useMyInvitedFriends(user?.uid);
  const { data: inviter } = useMyInviter(user?.uid);

  // A code typed on the login screen that could not be applied then (e.g. no network) is tried again here
  useEffect(() => {
    if (!user?.uid) return;
    referralService.applyPendingCode().then((result) => {
      if (result === "applied") queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all });
    });
  }, [user?.uid, queryClient]);

  const share = () => {
    if (!code) return;
    Share.share({ title: "City Online Mart", message: buildShareMessage(code) });
  };

  return (
    <View style={styles.container}>
      <GeneralTopBar text="Share & Earn" />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetchFriends()} />}>
        <Text style={styles.intro}>
          Invite a friend who is new to City Online Mart. When their first order is delivered, you earn a discount coupon.
        </Text>

        {isLoading ? (
          <ActivityIndicator style={{ marginVertical: 24 }} color={theme.colors.primary} />
        ) : isError || !code ? (
          <EmptyState
            tone="error"
            title="Couldn't load your code"
            message="Check your internet connection and try again."
            actionText="Retry"
            onAction={() => refetch()}
          />
        ) : (
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your referral code</Text>
            <Text style={styles.code} selectable>{code}</Text>
            <Pressable style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.8 }]} onPress={share}>
              <Text style={styles.shareButtonText}>Share with friends</Text>
            </Pressable>
          </View>
        )}

        {inviter ? (
          <Text style={styles.inviterText}>
            You joined with the code of {inviter.inviterName || "a friend"} ({formatDate(inviter.createdAt)}).
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>Friends you invited ({friends?.length ?? 0})</Text>
        {(friends ?? []).length === 0 ? (
          <Text style={styles.empty}>No one has used your code yet.</Text>
        ) : (
          (friends ?? []).map((friend) => (
            <View key={friend.id} style={styles.friendRow}>
              <Text style={styles.friendName}>{maskPhone(friend.inviteePhone)}</Text>
              <Text style={styles.friendStatus}>{statusText(friend)}</Text>
              <Text style={styles.friendDate}>Joined with your code on {formatDate(friend.createdAt)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ShareEarnScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, gap: 12, flexGrow: 1 },
  intro: { fontSize: 13, fontFamily: theme.fonts.regular, color: theme.colors.text },
  codeCard: {
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: theme.colors.background_3,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
  },
  codeLabel: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.text_secondary },
  code: { marginVertical: 6, fontSize: 30, letterSpacing: 4, fontFamily: theme.fonts.semibold, color: theme.colors.primary },
  shareButton: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, backgroundColor: theme.colors.primary },
  shareButtonText: { fontSize: 14, fontFamily: theme.fonts.semibold, color: "#fff" },
  inviterText: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.text_secondary },
  sectionTitle: { marginTop: 8, fontSize: 15, fontFamily: theme.fonts.semibold, color: theme.colors.text },
  empty: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.text_secondary },
  friendRow: { padding: 12, borderRadius: 8, backgroundColor: theme.colors.background_3, gap: 2 },
  friendName: { fontSize: 14, fontFamily: theme.fonts.semibold, color: theme.colors.text },
  friendStatus: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.text },
  friendDate: { fontSize: 11, fontFamily: theme.fonts.regular, color: theme.colors.text_secondary },
});
