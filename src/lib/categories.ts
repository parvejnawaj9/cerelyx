import type { EventCategory } from "@/lib/types";

/** Display labels for the categories used by templates / the gallery. */
export const CATEGORY_LABELS: Partial<Record<EventCategory, string>> = {
  wedding: "Wedding",
  engagement: "Engagement",
  reception: "Reception",
  anniversary: "Anniversary",
  birthday: "Birthday",
  "baby-shower": "Baby shower",
  "naming-ceremony": "Naming ceremony",
  housewarming: "Housewarming",
  graduation: "Graduation",
  corporate: "Corporate",
  "product-launch": "Product launch",
  reunion: "Reunion",
  festival: "Festival",
  custom: "Custom event",
};

export function categoryLabel(c: string): string {
  return CATEGORY_LABELS[c as EventCategory] ?? "Event";
}
