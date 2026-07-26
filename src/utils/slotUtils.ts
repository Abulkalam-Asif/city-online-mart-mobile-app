import { format, parse } from "date-fns";

/**
 * Converts a 24-hour time string (e.g. "15:00" or "18:00") to 12-hour format with AM/PM (e.g. "3:00 PM" or "6:00 PM").
 */
export function formatTo12Hour(timeStr?: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (
    trimmed === "Now" ||
    trimmed === "+60m" ||
    trimmed.toLowerCase().includes("am") ||
    trimmed.toLowerCase().includes("pm")
  ) {
    return trimmed;
  }
  try {
    const parsed = parse(trimmed, "HH:mm", new Date());
    return format(parsed, "h:mm a");
  } catch (error) {
    return timeStr;
  }
}

/**
 * Formats start and end times into a clean 12-hour time range (e.g. "11:00 AM - 3:00 PM").
 */
export function formatSlotTimeRange(startTime?: string, endTime?: string, expressDurationMinutes?: number): string {
  if (!startTime || !endTime) return "";
  if (startTime === "Now") return `Within ${expressDurationMinutes || 45} Minutes`;
  return `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
}
