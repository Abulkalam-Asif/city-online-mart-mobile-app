import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Dimensions, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import { useDeliverySlots } from "../../../hooks/useDeliverySlots";
import { useDeliverySettings } from "../../../hooks/useSettings";
import { DeliverySlot } from "../../../types";
import { format, parse, isAfter, isToday } from "date-fns";

export interface SelectedSlotData {
  date: string;
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface DeliverySlotSelectorProps {
  onSelectSlot: (slot: SelectedSlotData | null) => void;
  selectedSlot: SelectedSlotData | null;
}

export const DeliverySlotSelector: React.FC<DeliverySlotSelectorProps> = ({ onSelectSlot, selectedSlot }) => {
  const { data: days, isLoading, error } = useDeliverySlots(3);
  const { data: deliverySettings } = useDeliverySettings();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const fastDeliverySlot: DeliverySlot = {
    id: "fast-delivery",
    name: "Express Delivery",
    startTime: "Now",
    endTime: "+60m",
    limit: 100,
    currentOrders: 0
  };

  const handleCloseDropdown = () => {
    setDropdownVisible(false);
    if (selectedSlot) {
      if (selectedSlot.id === 'fast-delivery') {
        setSelectedDate('fast');
      } else {
        setSelectedDate(selectedSlot.date);
      }
    }
  };

  // Set default selected date when data loads
  useEffect(() => {
    if (days && days.length > 0 && !selectedDate) {
      setSelectedDate(days[0].date);
    }
  }, [days, selectedDate]);

  const activeDay = useMemo(() => {
    return days?.find(d => d.date === selectedDate) || null;
  }, [days, selectedDate]);

  // Check if a slot is disabled (fully booked or past cutoff)
  const isSlotDisabled = (dateStr: string, slot: DeliverySlot) => {
    // 1. Fully booked
    if (slot.currentOrders >= slot.limit) {
      return true;
    }

    // 2. Past Cutoff time
    const parsedDate = parse(dateStr, "yyyy-MM-dd", new Date());
    if (isToday(parsedDate)) {
      const now = new Date();
      // Cutoff is strictly 30 mins before end time
      try {
        const slotEndTime = parse(slot.endTime, "HH:mm", new Date());
        const cutoffTime = new Date(slotEndTime.getTime() - 30 * 60000);
        if (isAfter(now, cutoffTime)) {
          return true;
        }
      } catch (e) {
        console.error("Error parsing slot time", e);
      }
    }
    return false;
  };

  const handleSelectSlot = (date: string, slot: DeliverySlot) => {
    if (isSlotDisabled(date, slot)) return;

    if (selectedSlot?.id === slot.id && selectedSlot?.date === date) {
      setDropdownVisible(false);
    } else {
      onSelectSlot({
        date,
        id: slot.id,
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime
      });
      setDropdownVisible(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !days || days.length === 0) {
    return null; // Silently fail or show error
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Delivery Time</Text>
        {selectedSlot && (
          <View style={styles.selectedSlotChip}>
            <Text style={styles.selectedSlotChipText}>
              {selectedSlot.id === 'fast-delivery'
                ? (deliverySettings?.expressDeliveryBadgeText || '⚡ EXPRESS 45-Min')
                : `${format(parse(selectedSlot.date, "yyyy-MM-dd", new Date()), "EEE")}, ${selectedSlot.name} (${selectedSlot.startTime} - ${selectedSlot.endTime})`
              }
            </Text>
          </View>
        )}
      </View>

      {/* Date Scroller */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
        {days.map((day, index) => {
          const isSelected = selectedDate === day.date;
          const parsedDate = parse(day.date, "yyyy-MM-dd", new Date());
          const dayName = index === 0 ? "Today" : index === 1 ? "Tomorrow" : format(parsedDate, "dd MMM");
          const dayOfWeek = format(parsedDate, "EEE").toUpperCase();

          return (
            <Pressable
              key={day.date}
              style={[styles.dateCard, isSelected && styles.dateCardActive]}
              onPress={() => {
                setSelectedDate(day.date);
                setDropdownVisible(true);
              }}
            >
              <Text style={[styles.dayOfWeekText, isSelected && styles.dateTextActive]}>{dayOfWeek}</Text>
              <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>{dayName}</Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[styles.dateCard, styles.fastDeliveryCard, selectedDate === 'fast' && styles.dateCardActive]}
          onPress={() => {
            setSelectedDate('fast');
            setDropdownVisible(true);
            onSelectSlot({
              date: "fast",
              id: fastDeliverySlot.id,
              name: fastDeliverySlot.name,
              startTime: fastDeliverySlot.startTime,
              endTime: fastDeliverySlot.endTime
            });
          }}
        >
          <Text style={[styles.dayOfWeekText, { color: '#d97706' }]}>⚡ EXPRESS</Text>
          <Text style={[styles.dateText, selectedDate === 'fast' && styles.dateTextActive]}>
            {deliverySettings?.expressDeliveryButtonText || '45-Minutes'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Tooltip Backdrop & Content */}
      <Modal visible={dropdownVisible} transparent animationType="fade" onRequestClose={handleCloseDropdown}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseDropdown} />
          <View style={styles.tooltipContainer}>
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>Select Time</Text>
              <Pressable onPress={handleCloseDropdown} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>X</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.tooltipContent} nestedScrollEnabled={true}>
              {selectedDate === 'fast' ? (
                <Pressable
                  style={[styles.modalSlotCard, selectedSlot?.id === 'fast-delivery' && styles.slotCardSelected]}
                  onPress={() => handleSelectSlot("fast", fastDeliverySlot)}
                >
                  <View style={styles.slotInfo}>
                    <Text style={styles.slotName}>⚡ EXPRESS DELIVERY</Text>
                    <Text style={styles.slotTime}>{deliverySettings?.expressDeliveryTagline || 'Get it delivered within an hour'}</Text>
                  </View>
                </Pressable>
              ) : activeDay?.slots?.length === 0 ? (
                <Text style={styles.emptyText}>No delivery slots available for this day.</Text>
              ) : (
                activeDay?.slots?.map((slot) => {
                  const disabled = isSlotDisabled(activeDay.date, slot);
                  const isSelected = selectedSlot?.id === slot.id && selectedSlot?.date === activeDay.date;

                  return (
                    <Pressable
                      key={slot.id}
                      style={[
                        styles.modalSlotCard,
                        isSelected && styles.slotCardSelected,
                        disabled && styles.slotCardDisabled
                      ]}
                      onPress={() => handleSelectSlot(activeDay.date, slot)}
                    >
                      <View style={styles.slotInfo}>
                        <Text style={[styles.slotName, disabled && styles.disabledText]}>{slot.name}</Text>
                        <Text style={[styles.slotTime, disabled && styles.disabledText]}>
                          {slot.startTime} - {slot.endTime}
                        </Text>
                      </View>

                      {disabled && (
                        <View style={styles.badgeDisabled}>
                          <Text style={styles.badgeTextDisabled}>Fully Booked</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width: windowWidth } = Dimensions.get('window');
// Screen Width - cart padding (16) - delivery borders (2) - scroll padding (24) - gaps (24) = 66
// Using 70 to be safe with float rounding
const AVAILABLE_WIDTH = windowWidth - 70;
// We have 3 normal buttons (w) and 1 express button (1.25w). Total = 4.25w
const NORMAL_BUTTON_WIDTH = AVAILABLE_WIDTH / 4.25;
const EXPRESS_BUTTON_WIDTH = NORMAL_BUTTON_WIDTH * 1.25;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedSlotChip: {
    backgroundColor: theme.colors.primary_light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  selectedSlotChipText: {
    fontSize: 11,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  dateScroll: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  dateCard: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background_3,
    width: NORMAL_BUTTON_WIDTH,
  },
  fastDeliveryCard: {
    borderColor: '#d97706',
    backgroundColor: '#fff3e6',
    width: EXPRESS_BUTTON_WIDTH,
  },
  dateCardActive: {
    backgroundColor: theme.colors.primary_light,
    borderColor: theme.colors.primary,
  },
  dayOfWeekText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: theme.colors.text_secondary,
    marginBottom: 2,
  },
  dateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: theme.colors.text_secondary,
  },
  dateTextActive: {
    color: theme.colors.primary,
  },
  slotsContainer: {
    paddingHorizontal: 12,
    marginTop: 8,
    paddingBottom: 8,
  },
  slotCard: {
    backgroundColor: theme.colors.background_3,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: 110,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  slotCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary_light,
  },
  slotCardDisabled: {
    opacity: 0.6,
  },
  slotInfo: {
    alignItems: "flex-start",
  },
  slotName: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  slotTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.text_secondary,
  },
  disabledText: {
    color: theme.colors.placeholder,
  },
  badgeDisabled: {
    backgroundColor: '#ffbbc1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeTextDisabled: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: '#922932',
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text_secondary,
    textAlign: "center",
    marginTop: 8,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 200,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    maxHeight: 300,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text_secondary,
  },
  tooltipContent: {
    gap: 8,
  },
  modalSlotCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background_3,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
