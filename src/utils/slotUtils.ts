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
  } catch {
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

/**
 * Checks if the current local time is between startTime (e.g. "09:00") and endTime (e.g. "21:00").
 * Defaults to true if times are not specified.
 */
export function isWithinOperatingHours(startTimeStr?: string, endTimeStr?: string): boolean {
  if (!startTimeStr || !endTimeStr) return true;
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTimeStr.split(":").map(Number);
    const startMinutes = startH * 60 + (startM || 0);

    const [endH, endM] = endTimeStr.split(":").map(Number);
    const endMinutes = endH * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight window (e.g. 22:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  } catch {
    return true;
  }
}

