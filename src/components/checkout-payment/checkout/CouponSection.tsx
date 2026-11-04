import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/AuthContext";
import { couponService } from "@/src/services";
import type { ResolvedCoupon } from "@/src/services/couponRedemption";
import { getFriendlyErrorMessage } from "@/src/utils/errorUtils";
import { formatPrice } from "@/src/utils/formatPrice";

interface CouponSectionProps {
  coupon: ResolvedCoupon | null;
  onChange: (coupon: ResolvedCoupon | null) => void;
  /** Why the applied coupon cannot be used with this order (its minimum), or null. */
  minimumError?: string | null;
}

/**
 * "Have a coupon?" box on the checkout screen (B-063). The code is checked for the signed-in customer
 * here, so a wrong or used code is refused before the order is placed; `OrderService.createOrder`
 * checks it again inside the order transaction.
 */
const CouponSection: React.FC<CouponSectionProps> = ({ coupon, onChange, minimumError }) => {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const apply = async () => {
    if (!user || !code.trim() || checking) return;
    setChecking(true);
    setMessage(null);
    try {
      onChange(await couponService.checkCode(code, user.uid));
    } catch (error) {
      onChange(null);
      setMessage(getFriendlyErrorMessage(error, "Could not check the coupon. Please try again."));
    } finally {
      setChecking(false);
    }
  };

  const remove = () => {
    onChange(null);
    setCode("");
    setMessage(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Coupon</Text>

      {coupon ? (
        <View style={styles.appliedRow}>
          <View style={styles.appliedInfo}>
            <Text style={styles.appliedCode}>{coupon.coupon.code}</Text>
            <Text style={styles.appliedTerms}>
              {coupon.coupon.percentage}% off
              {coupon.coupon.minPurchaseAmount ? ` · min order Rs. ${formatPrice(coupon.coupon.minPurchaseAmount)}` : ""}
              {coupon.coupon.maxDiscountAmount ? ` · up to Rs. ${formatPrice(coupon.coupon.maxDiscountAmount)}` : ""}
            </Text>
          </View>
          <Pressable onPress={remove} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove coupon">
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(text) => {
              setCode(text);
              if (message) setMessage(null);
            }}
            placeholder="Enter coupon code"
            placeholderTextColor={theme.colors.placeholder}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            returnKeyType="done"
            onSubmitEditing={apply}
          />
          <Pressable
            onPress={apply}
            disabled={!code.trim() || checking}
            style={[styles.applyButton, (!code.trim() || checking) && styles.applyButtonDisabled]}
            accessibilityRole="button">
            {checking ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.applyText}>Apply</Text>}
          </Pressable>
        </View>
      )}

      {message && <Text style={styles.errorText}>{message}</Text>}
      {minimumError && <Text style={styles.errorText}>{minimumError}</Text>}
    </View>
  );
};

export default CouponSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 14,
    backgroundColor: theme.colors.background_3,
    borderRadius: 8,
  },
  titleText: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    backgroundColor: "#fff",
  },
  applyButton: {
    height: 40,
    minWidth: 72,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: "#fff",
  },
  appliedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  appliedInfo: {
    flex: 1,
  },
  appliedCode: {
    fontSize: 13,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  appliedTerms: {
    fontSize: 11,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text_secondary,
    marginTop: 2,
  },
  removeText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text_secondary,
  },
  errorText: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: theme.fonts.regular,
    color: theme.colors.error,
  },
});
