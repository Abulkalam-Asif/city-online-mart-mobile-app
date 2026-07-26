import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import { useDeliverySlots } from "../../../hooks/useDeliverySlots";
import { useDeliverySettings } from "../../../hooks/useSettings";
import { DeliverySlot } from "../../../types";
import { format, parse, isAfter, isToday, isTomorrow } from "date-fns";
import { formatSlotTimeRange } from "../../../utils/slotUtils";

export interface SelectedSlotData {
  date: string;
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  slotStartTimestamp?: number;
  expressDurationMinutes?: number;
}

interface DeliverySlotSelectorProps {
  onSelectSlot: (slot: SelectedSlotData | null) => void;
  selectedSlot: SelectedSlotData | null;
}

export const DeliverySlotSelector: React.FC<DeliverySlotSelectorProps> = ({ onSelectSlot, selectedSlot }) => {
  const { data: days, isLoading, error } = useDeliverySlots();
  const { data: deliverySettings } = useDeliverySettings();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const fastDeliverySlot: DeliverySlot = {
    id: "fast-delivery",
    name: "Express Delivery",
    startTime: "Now",
    endTime: `+${deliverySettings?.expressDeliveryDurationMinutes || 45}m`,
    limit: 100,
    currentOrders: 0
  };

  const cutoffMinutes = deliverySettings?.cutoffTimeMinutes ?? 30;

  const isSlotPastCutoff = (dateStr: string, slot: DeliverySlot) => {
    const parsedDate = parse(dateStr, "yyyy-MM-dd", new Date());
    if (isToday(parsedDate)) {
      const now = new Date();
      try {
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        const slotStartTimeDate = new Date(parsedDate);
        slotStartTimeDate.setHours(hours, minutes, 0, 0);
        const cutoffTime = new Date(slotStartTimeDate.getTime() - cutoffMinutes * 60000);
        if (now >= cutoffTime) {
          return true;
        }
      } catch (e) {
        console.error("Error parsing slot time", e);
      }
    }
    return false;
  };

  const isSlotFullyBooked = (slot: DeliverySlot) => {
    return slot.currentOrders >= slot.limit;
  };

  // Filter out days that have 0 non-past-cutoff slots available (Rule: days with no available slots are not shown)
  const validDays = useMemo(() => {
    if (!days) return [];
    return days.filter(day => {
      if (!day.slots || day.slots.length === 0) return false;
      return day.slots.some(slot => !isSlotPastCutoff(day.date, slot));
    });
  }, [days, cutoffMinutes]);

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

  // Auto-assign first available slot when data loads and no slot is selected
  useEffect(() => {
    if (validDays && validDays.length > 0 && !selectedSlot) {
      for (const day of validDays) {
        const available = day.slots.find(s => !isSlotPastCutoff(day.date, s) && !isSlotFullyBooked(s));
        if (available) {
          const parsedDate = parse(day.date, "yyyy-MM-dd", new Date());
          const [hours, minutes] = available.startTime.split(':').map(Number);
          const slotStartTimeDate = new Date(parsedDate);
          slotStartTimeDate.setHours(hours, minutes, 0, 0);

          setSelectedDate(day.date);
          onSelectSlot({
            date: day.date,
            id: available.id,
            name: available.name,
            startTime: available.startTime,
            endTime: available.endTime,
            slotStartTimestamp: slotStartTimeDate.getTime()
          });
          return;
        }
      }
      setSelectedDate(validDays[0].date);
    } else if (selectedSlot) {
      if (selectedSlot.id === 'fast-delivery') {
        setSelectedDate('fast');
      } else {
        setSelectedDate(selectedSlot.date);
      }
    }
  }, [validDays, selectedSlot, cutoffMinutes]);

  const activeDay = useMemo(() => {
    return validDays?.find(d => d.date === selectedDate) || null;
  }, [validDays, selectedDate]);

  // Filter out slots whose cutoff time has passed
  const visibleSlots = useMemo(() => {
    if (!activeDay || !activeDay.slots) return [];
    return activeDay.slots.filter(s => !isSlotPastCutoff(activeDay.date, s));
  }, [activeDay, cutoffMinutes]);

  const handleSelectSlot = (date: string, slot: DeliverySlot) => {
    if (isSlotFullyBooked(slot)) return;

    if (selectedSlot?.id === slot.id && selectedSlot?.date === date) {
      setDropdownVisible(false);
    } else {
      const parsedDate = parse(date, "yyyy-MM-dd", new Date());
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const slotStartTimeDate = new Date(parsedDate);
      slotStartTimeDate.setHours(hours, minutes, 0, 0);

      onSelectSlot({
        date,
        id: slot.id,
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotStartTimestamp: slotStartTimeDate.getTime()
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
    return null;
  }

  const getSelectedSlotChipText = (slot: SelectedSlotData) => {
    if (slot.id === 'fast-delivery') {
      return deliverySettings?.expressDeliveryBadgeText || '⚡ EXPRESS 45-Min';
    }
    try {
      const parsedDate = parse(slot.date, "yyyy-MM-dd", new Date());
      let dayPrefix = format(parsedDate, "EEE");
      if (isToday(parsedDate)) {
        dayPrefix = "Today";
      } else if (isTomorrow(parsedDate)) {
        dayPrefix = "Tomorrow";
      }
      return `${dayPrefix}, ${slot.name} (${formatSlotTimeRange(slot.startTime, slot.endTime)})`;
    } catch {
      return `${slot.name} (${formatSlotTimeRange(slot.startTime, slot.endTime)})`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Delivery Time</Text>
        {selectedSlot && (
          <View style={styles.selectedSlotChip}>
            <Text style={styles.selectedSlotChipText} numberOfLines={1} ellipsizeMode="tail">
              {getSelectedSlotChipText(selectedSlot)}
            </Text>
          </View>
        )}
      </View>

      {/* Date Scroller - Express Delivery ALWAYS at Index 0 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
        {deliverySettings?.expressDeliveryEnabled && (
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
                endTime: fastDeliverySlot.endTime,
                slotStartTimestamp: Date.now(),
                expressDurationMinutes: deliverySettings?.expressDeliveryDurationMinutes || 45,
              });
            }}
          >
            <Text style={[styles.dayOfWeekText, { color: theme.colors.express }]}>⚡ EXPRESS</Text>
            <Text style={[styles.dateText, selectedDate === 'fast' && styles.dateTextActive]}>
              {deliverySettings?.expressDeliveryButtonText || '45-Minutes'}
            </Text>
          </Pressable>
        )}

        {validDays.map((day) => {
          const isSelected = selectedDate === day.date;
          const parsedDate = parse(day.date, "yyyy-MM-dd", new Date());

          let topLabel = format(parsedDate, "EEE").toUpperCase();
          let bottomLabel = format(parsedDate, "dd MMM");

          if (isToday(parsedDate)) {
            topLabel = "TODAY";
          } else if (isTomorrow(parsedDate)) {
            topLabel = "TOMORROW";
          }

          return (
            <Pressable
              key={day.date}
              style={[styles.dateCard, isSelected && styles.dateCardActive]}
              onPress={() => {
                setSelectedDate(day.date);
                setDropdownVisible(true);
              }}
            >
              <Text style={[styles.dayOfWeekText, isSelected && styles.dateTextActive]}>{topLabel}</Text>
              <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>{bottomLabel}</Text>
            </Pressable>
          );
        })}
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
              ) : visibleSlots.length === 0 ? (
                <Text style={styles.emptyText}>No available delivery slots for this day.</Text>
              ) : (
                visibleSlots.map((slot) => {
                  const fullyBooked = isSlotFullyBooked(slot);
                  const isSelected = selectedSlot?.id === slot.id && selectedSlot?.date === activeDay?.date;

                  return (
                    <Pressable
                      key={slot.id}
                      style={[
                        styles.modalSlotCard,
                        isSelected && styles.slotCardSelected,
                        fullyBooked && styles.slotCardDisabled
                      ]}
                      onPress={() => activeDay && handleSelectSlot(activeDay.date, slot)}
                    >
                      <View style={styles.slotInfo}>
                        <Text style={[styles.slotName, fullyBooked && styles.disabledText]}>{slot.name}</Text>
                        <Text style={[styles.slotTime, fullyBooked && styles.disabledText]}>
                          {formatSlotTimeRange(slot.startTime, slot.endTime)}
                        </Text>
                      </View>

                      {fullyBooked && (
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
    gap: 6,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.text,
  },
  selectedSlotChip: {
    backgroundColor: theme.colors.primary_light,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    maxWidth: "72%",
  },
  selectedSlotChipText: {
    fontSize: 10,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  dateScroll: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  dateCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background_3,
    minWidth: 72,
    maxWidth: 105,
  },
  fastDeliveryCard: {
    borderColor: theme.colors.express_border,
    backgroundColor: theme.colors.express_bg,
    minWidth: 84,
    maxWidth: 115,
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
