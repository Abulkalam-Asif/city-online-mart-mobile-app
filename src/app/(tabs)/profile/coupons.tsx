import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { useMemo, useState } from "react";
import GeneralTopBar from "@/src/components/general/GeneralTopBar";
import EmptyState from "@/src/components/common/EmptyState";
import { theme } from "@/src/constants/theme";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { useMyCoupons } from "@/src/hooks/useCoupons";
import { formatPrice } from "@/src/utils/formatPrice";
import type { CustomerCoupon } from "@/src/types";

type Tab = "available" | "history";

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

const isExpired = (coupon: CustomerCoupon, now: Date) => !!coupon.expiresAt && coupon.expiresAt < now;

const termsText = (c: CustomerCoupon) => {
  const parts = [`${c.percentage}% off`];
  if (c.minPurchaseAmount) parts.push(`min order Rs. ${formatPrice(c.minPurchaseAmount)}`);
  if (c.maxDiscountAmount) parts.push(`up to Rs. ${formatPrice(c.maxDiscountAmount)}`);
  return parts.join(" · ");
};

/**
 * "My Coupons" (B-063): the coupons the customer can use (earned or given by the shop) and the history
 * of the ones already used. Typed coupons that were never used do not appear here.
 */
const CouponsScreen = () => {
  const { data: user } = useAuthUser();
  const { data: coupons, isLoading, isError, refetch, isRefetching } = useMyCoupons(user?.uid);
  const [tab, setTab] = useState<Tab>("available");

  const { available, history } = useMemo(() => {
    const now = new Date();
    const all = coupons ?? [];
    return {
      available: all.filter((c) => c.status === "available" && !isExpired(c, now)),
      // Used coupons, and earned ones that ran out or were voided
      history: all.filter((c) => c.status !== "available" || isExpired(c, now)),
    };
  }, [coupons]);

  const list = tab === "available" ? available : history;

  const renderItem = ({ item }: { item: CustomerCoupon }) => {
    const expired = item.status === "available" && isExpired(item, new Date());
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.code}>{item.code}</Text>
          {item.status === "used" ? (
            <Text style={styles.usedBadge}>Used</Text>
          ) : item.status === "void" ? (
            <Text style={styles.mutedBadge}>Cancelled</Text>
          ) : expired ? (
            <Text style={styles.mutedBadge}>Expired</Text>
          ) : null}
        </View>
        <Text style={styles.terms}>{termsText(item)}</Text>
        {item.status === "used" ? (
          <Text style={styles.detail}>
            Used on {item.usedAt ? formatDate(item.usedAt) : ""}
            {item.orderId ? ` · Order #${item.orderId}` : ""}
            {item.amountSaved ? ` · Saved Rs. ${formatPrice(item.amountSaved)}` : ""}
          </Text>
        ) : item.expiresAt ? (
          <Text style={styles.detail}>
            {expired ? "Expired" : "Valid until"} {formatDate(item.expiresAt)}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GeneralTopBar text="My Coupons" />

      <View style={styles.tabs}>
        {(["available", "history"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "available" ? `Available (${available.length})` : `History (${history.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <EmptyState
          tone="error"
          title="Couldn't load your coupons"
          message="Check your internet connection and try again."
          actionText="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          ListEmptyComponent={
            tab === "available" ? (
              <EmptyState
                icon="ticket-outline"
                title="No coupons yet"
                message="Coupons you earn will appear here. A coupon code you type at checkout is used straight away."
              />
            ) : (
              <EmptyState icon="receipt-outline" title="No coupon history" message="Coupons you use will be listed here." />
            )
          }
        />
      )}
    </View>
  );
};

export default CouponsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabs: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: theme.colors.background_3,
  },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 12, fontFamily: theme.fonts.semibold, color: theme.colors.text },
  tabTextActive: { color: "#fff" },
  listContent: { padding: 20, gap: 10, flexGrow: 1 },
  card: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: theme.colors.background_3,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { fontSize: 15, fontFamily: theme.fonts.semibold, color: theme.colors.primary },
  usedBadge: { fontSize: 11, fontFamily: theme.fonts.semibold, color: theme.colors.text_secondary },
  mutedBadge: { fontSize: 11, fontFamily: theme.fonts.semibold, color: theme.colors.error },
  terms: { marginTop: 4, fontSize: 12, fontFamily: theme.fonts.regular, color: theme.colors.text },
  detail: { marginTop: 4, fontSize: 11, fontFamily: theme.fonts.regular, color: theme.colors.text_secondary },
});
