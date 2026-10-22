import { StyleSheet, View } from "react-native";
import React from "react";
import ScreenFooter from "@/src/components/general/ScreenFooter";
import { SkeletonBox, SkeletonPulse } from "@/src/components/common/Skeleton";

/**
 * Loading placeholder for the cart, under the real top bar. Same layout as the real screen
 * (delivery card, items card with three rows, footer with total and button), so nothing jumps
 * when the cart arrives. Sizes follow `cart.tsx`, `DeliverySlotSelector.tsx` and `CartItem.tsx`.
 */
const CartSkeleton = () => {
  return (
    <>
      <SkeletonPulse style={styles.sectionsWrapper}>
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <SkeletonBox width={110} height={16} radius={6} />
            <SkeletonBox width={170} height={28} radius={14} />
          </View>
          <View style={styles.dateRow}>
            {[0, 1, 2].map((i) => (
              <SkeletonBox key={i} width={72} height={56} radius={8} />
            ))}
            <SkeletonBox width={84} height={56} radius={8} style={styles.expressChip} />
          </View>
        </View>

        <View style={styles.itemsCard}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.itemRow}>
              <SkeletonBox width={64} height={64} radius={8} />
              <View style={styles.itemText}>
                <SkeletonBox width="80%" height={12} radius={6} />
                <SkeletonBox width="50%" height={12} radius={6} />
              </View>
              <SkeletonBox width={102} height={28} radius={14} />
            </View>
          ))}
        </View>
      </SkeletonPulse>

      <ScreenFooter>
        <SkeletonPulse>
          <View style={styles.totalRow}>
            <SkeletonBox width={140} height={20} radius={6} />
            <SkeletonBox width={96} height={24} radius={6} />
          </View>
          <SkeletonBox width="100%" height={48} radius={30} style={styles.button} />
        </SkeletonPulse>
      </ScreenFooter>
    </>
  );
};

export default CartSkeleton;

const styles = StyleSheet.create({
  sectionsWrapper: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 16,
  },
  deliveryCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingBottom: 12,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },
  expressChip: {
    marginLeft: "auto",
  },
  itemsCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemText: {
    flex: 1,
    gap: 8,
    marginHorizontal: 12,
  },
  totalRow: {
    height: 30, // the real row is as tall as the discount badge
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    marginTop: 4,
  },
});
