import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { theme } from "@/src/constants/theme";
import { PaymentMethod, PaymentMethodType } from "@/src/types/payment_method.types";
import { getPaymentMethodImage } from "@/src/utils/paymentMethodUtils";

type PaymentMethodOptionsProps = {
  types: { type: PaymentMethodType; label: string }[];
  selectedType: PaymentMethodType | "";
  onSelectType: (type: PaymentMethodType) => void;
  bankAccounts: PaymentMethod[];
  selectedBankId: string;
  onSelectBank: (id: string) => void;
};

const RadioDot = ({ selected }: { selected: boolean }) => (
  <View style={[styles.radio, selected && styles.radioSelected]}>
    {selected && <View style={styles.radioInner} />}
  </View>
);

// Every active payment method is shown as a button, so the customer picks with one tap.
// Bank accounts open under "Bank Transfer" once it is chosen.
const PaymentMethodOptions = ({
  types,
  selectedType,
  onSelectType,
  bankAccounts,
  selectedBankId,
  onSelectBank,
}: PaymentMethodOptionsProps) => {
  if (types.length === 0) {
    return <Text style={styles.emptyText}>No active payment methods available.</Text>;
  }

  return (
    <View style={styles.list}>
      {types.map((item) => {
        const isSelected = item.type === selectedType;
        return (
          <View key={item.type}>
            <Pressable
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelectType(item.type)}
            >
              <Image source={getPaymentMethodImage(item.type)} style={styles.icon} />
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {item.label}
              </Text>
              <RadioDot selected={isSelected} />
            </Pressable>

            {isSelected && item.type === "bank_transfer" && (
              <View style={styles.bankList}>
                <Text style={styles.bankLabel}>Choose a bank account</Text>
                {bankAccounts.map((bank) => {
                  const isBankSelected = bank.id === selectedBankId;
                  return (
                    <Pressable
                      key={bank.id}
                      style={[styles.option, isBankSelected && styles.optionSelected]}
                      onPress={() => onSelectBank(bank.id)}
                    >
                      <Text
                        style={[styles.optionText, isBankSelected && styles.optionTextSelected]}
                      >
                        {bank.accountDetails?.bankName || "Unknown Bank"}
                      </Text>
                      <RadioDot selected={isBankSelected} />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default PaymentMethodOptions;

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.background,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary_light,
    borderColor: theme.colors.primary,
  },
  icon: {
    width: 24,
    height: 24,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  optionTextSelected: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.placeholder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  bankList: {
    marginTop: 8,
    marginLeft: 16,
    gap: 8,
  },
  bankLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text_secondary,
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: theme.colors.text_secondary,
  },
});
