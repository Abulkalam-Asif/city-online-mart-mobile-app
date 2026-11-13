import type { DeliveryArea } from "../types/delivery_area.types";

/**
 * Search and sort for the delivery area picker (B-072). Copy of the matching helpers in
 * `admin/src/utils/deliveryAreas.ts`; keep the behaviour the same.
 */

/** Sorts by name the way people read chak numbers: "Chak 77" before "Chak 125". */
export function compareAreaNames(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

const clean = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * The areas matching what was typed: every typed word must appear in the name or in one of the
 * keywords, in any letter case. An empty search returns all areas.
 */
export function searchAreas<T extends Pick<DeliveryArea, "name" | "keywords">>(areas: T[], search: string): T[] {
  const words = clean(search).split(" ").filter(Boolean);
  if (words.length === 0) return areas;
  return areas.filter((area) => {
    const haystack = [area.name.toLowerCase(), ...area.keywords].join("\n");
    return words.every((word) => haystack.includes(word));
  });
}
