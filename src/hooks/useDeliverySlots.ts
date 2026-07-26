import { useQuery } from "@tanstack/react-query";
import { deliverySlotService } from "../services";
import { DailyDeliverySlotDoc } from "../types";
import { useDeliverySettings } from "./useSettings";

export const useDeliverySlots = (overrideDays?: number) => {
  const { data: deliverySettings } = useDeliverySettings();
  const daysToFetch = overrideDays ?? deliverySettings?.mobileDisplayDays ?? 5;

  return useQuery<DailyDeliverySlotDoc[], Error>({
    queryKey: ["deliverySlots", daysToFetch],
    queryFn: async () => {
      const days = await deliverySlotService.getNextDays(daysToFetch);
      // Auto-expansion check: if returned days have 0 available slots, attempt fetching 1 extra day up to max 14
      if (days && days.length > 0) {
        const hasAnyAvailableSlot = days.some(d => d.slots && d.slots.some(s => s.currentOrders < s.limit));
        if (!hasAnyAvailableSlot && daysToFetch < 14) {
          return await deliverySlotService.getNextDays(daysToFetch + 1);
        }
      }
      return days;
    },
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 15000, // Poll every 15 seconds
  });
};
