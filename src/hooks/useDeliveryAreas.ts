import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query";
import { deliveryAreaService } from "../services";

/**
 * The city's delivery area check (B-072): `data.areas` is the active areas and is an empty array when
 * the check is off (a super-admin switched it off, or no area is active); a failed read is an
 * `error`, never an empty list.
 *
 * Short cache: when the owner switches the check off because of problems, customers must not stay
 * blocked for minutes, so checkout re-reads it when it opens and after 30 seconds.
 */
export function useDeliveryAreas() {
  return useQuery({
    queryKey: queryKeys.deliveryAreas.all,
    queryFn: () => deliveryAreaService.getCheck(),
    staleTime: 1000 * 30, // 30 seconds
  });
}
