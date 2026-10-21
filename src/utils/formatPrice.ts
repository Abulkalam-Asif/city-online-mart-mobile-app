/**
 * Formats a rupee amount with thousands separators: 10991 -> "10,991".
 * Rupees are shown as the number is stored (no rounding, no forced decimals).
 */
export const formatPrice = (value: number | null | undefined): string => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0";

  const [whole, fraction] = String(amount).split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${withCommas}.${fraction}` : withCommas;
};
