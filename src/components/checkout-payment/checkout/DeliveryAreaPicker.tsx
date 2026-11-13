import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/src/constants/theme";
import EmptyState from "@/src/components/common/EmptyState";
import { searchAreas } from "@/src/utils/deliveryAreas";
import type { DeliveryArea, OrderDeliveryArea } from "@/src/types/delivery_area.types";

type DeliveryAreaPickerProps = {
  /** Active areas of the city. Rendered only when there is at least one (an empty list = check off). */
  areas: DeliveryArea[];
  selected: OrderDeliveryArea | null;
  /** The customer said "my area is not listed": delivery is not available, the order is blocked. */
  notListed: boolean;
  onSelect: (area: OrderDeliveryArea) => void;
  onNotListed: () => void;
  disabled?: boolean;
};

/**
 * The delivery area field of the checkout address step (B-072): a box that opens a searchable
 * list. The last row, "My area is not listed", shows the not-available message and blocks the order.
 */
const DeliveryAreaPicker = ({ areas, selected, notListed, onSelect, onNotListed, disabled }: DeliveryAreaPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const visible = useMemo(() => searchAreas(areas, search), [areas, search]);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  const label = notListed ? "My area is not listed" : selected?.name ?? "Choose your area";

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>Delivery Area</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delivery area: ${label}`}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, selected && !notListed && styles.fieldSelected, notListed && styles.fieldError]}>
        <Text
          numberOfLines={1}
          style={[styles.fieldText, !selected && !notListed && styles.fieldPlaceholder]}>
          {label}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.text_secondary} />
      </Pressable>

      {notListed && (
        <View style={styles.notice}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
          <Text style={styles.noticeText}>
            Sorry, we are not available in this area yet. You can only order from the areas in our list.
          </Text>
        </View>
      )}

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={styles.backdropTouch} onPress={close} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose your area</Text>
              <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>
            <TextInput
              style={styles.search}
              value={search}
              onChangeText={setSearch}
              placeholder="Search your colony, town or chak number"
              placeholderTextColor={theme.colors.placeholder}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            <FlatList
              data={visible}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ListEmptyComponent={
                <EmptyState
                  compact
                  icon="search-outline"
                  title="No area found"
                  message="Check the spelling, or choose “My area is not listed” below."
                />
              }
              renderItem={({ item }) => {
                const isSelected = !notListed && selected?.id === item.id;
                return (
                  <Pressable
                    style={[styles.row, isSelected && styles.rowSelected]}
                    onPress={() => {
                      onSelect({ id: item.id, name: item.name });
                      close();
                    }}>
                    <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>{item.name}</Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color={theme.colors.primary} />}
                  </Pressable>
                );
              }}
              ListFooterComponent={
                <Pressable
                  style={[styles.row, styles.rowNotListed]}
                  onPress={() => {
                    onNotListed();
                    close();
                  }}>
                  <Text style={styles.rowNotListedText}>My area is not listed</Text>
                </Pressable>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

/** Shown instead of the picker while the area list loads. */
export const DeliveryAreaLoading = () => (
  <View style={styles.container}>
    <Text style={styles.inputLabel}>Delivery Area</Text>
    <View style={[styles.field, styles.loadingField]}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text style={styles.fieldPlaceholder}>Loading areas...</Text>
    </View>
  </View>
);

/** Shown when the area list could not be read: the customer must retry, the check is not skipped. */
export const DeliveryAreaError = ({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.container}>
    <Text style={styles.inputLabel}>Delivery Area</Text>
    <EmptyState
      compact
      tone="error"
      title="Couldn't load delivery areas"
      message="Check your internet connection and try again."
      actionText="Retry"
      onAction={onRetry}
    />
  </View>
);

export default DeliveryAreaPicker;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldSelected: {
    borderColor: theme.colors.primary,
  },
  fieldError: {
    borderColor: theme.colors.error,
  },
  loadingField: {
    justifyContent: "flex-start",
  },
  fieldText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  fieldPlaceholder: {
    color: theme.colors.placeholder,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: theme.colors.error_light,
    borderRadius: 8,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "75%",
    gap: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.background,
  },
  rowSelected: {
    backgroundColor: theme.colors.primary_light,
    borderRadius: 8,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  rowTextSelected: {
    fontFamily: theme.fonts.medium,
  },
  rowNotListed: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  rowNotListedText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.error,
  },
});
