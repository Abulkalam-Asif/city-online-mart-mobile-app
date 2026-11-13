import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { deliveryAreaService } from "../services";

/**
 * The city's active delivery areas (B-072). `data` is an empty array when the city has no active
 * area (the check is off); a failed read is an `error`, never an empty list.
 */
export function useDeliveryAreas() {
  return useQuery({
    queryKey: queryKeys.deliveryAreas.all,
    queryFn: () => deliveryAreaService.getActiveAreas(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
