import { useQuery } from "@tanstack/react-query";
import { couponService } from "../services";
import { queryKeys } from "../lib/react-query";

/**
 * The signed-in customer's coupons (B-063): available ones and the history of used ones.
 * Refreshed after every order attempt (see usePlaceOrder), since an order uses a coupon.
 */
export function useMyCoupons(customerId?: string) {
  return useQuery({
    queryKey: queryKeys.coupons.mine(customerId ?? ""),
    queryFn: () => couponService.getMyCoupons(customerId!),
    enabled: !!customerId,
  });
}
