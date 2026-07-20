import { useQuery } from "@tanstack/react-query";
import { deliverySlotService } from "../services";
import { DailyDeliverySlotDoc } from "../types";

export const useDeliverySlots = (daysToFetch: number = 3) => {
  return useQuery<DailyDeliverySlotDoc[], Error>({
    queryKey: ["deliverySlots", daysToFetch],
    queryFn: () => deliverySlotService.getNextDays(daysToFetch),
    staleTime: 5 * 60 * 1000, // 5 minutes (they change relatively slowly, but slots fill up)
  });
};
