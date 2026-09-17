export type Category = "learn" | "create" | "move" | "explore" | "connect" | "eatdrink" | "shop";

export interface Quest {
  id: string;
  category: Category;
  title: string;
  description: string;
  imageUrl: string;
  price: number; // 0 = free, in euros
  durationMinutes?: number;
  // ISO date (YYYY-MM-DD) for a one-time, dated event (a concert, festival,
  // ...). Omitted for evergreen venues/activities, which always match any
  // date filter - most of the current catalog.
  eventDate?: string;
  latitude: number;
  longitude: number;
  minGroupSize: number;
  maxGroupSize: number;
  city: string;
  tags: string[];
  rating: number; // 0-5
}

// A Quest with its live distance to the user filled in (see haversineKm in
// src/utils/location.ts). distanceKm is null while the user's location is
// unknown (permission denied/unavailable) — such quests aren't distance-filtered.
export interface QuestWithDistance extends Quest {
  distanceKm: number | null;
}

export type DateRange = "any" | "today" | "week" | "month" | "3months";

export interface FilterSettings {
  maxDistanceKm: number;
  maxPrice: number;
  groupSize: number;
  categories: Category[];
  dateRange: DateRange;
}

export const DEFAULT_FILTERS: FilterSettings = {
  maxDistanceKm: 25,
  maxPrice: 50,
  groupSize: 2,
  categories: ["learn", "create", "move", "explore", "connect", "eatdrink", "shop"],
  dateRange: "any",
};

// Brand category tokens stay in English per the branding briefing, even
// inside the otherwise Dutch UI - they read as brand vocabulary, not copy.
export const CATEGORY_LABELS: Record<Category, string> = {
  learn: "Learn",
  create: "Create",
  move: "Move",
  explore: "Explore",
  connect: "Connect",
  eatdrink: "Eat & Drink",
  shop: "Shop",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  learn: "book-outline",
  create: "color-palette-outline",
  move: "footsteps-outline",
  explore: "telescope-outline",
  connect: "people-outline",
  eatdrink: "restaurant-outline",
  shop: "storefront-outline",
};

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  any: "Altijd",
  today: "Vandaag",
  week: "Deze week",
  month: "Deze maand",
  "3months": "Binnen 3 maanden",
};

const DATE_RANGE_MAX_DAYS: Record<Exclude<DateRange, "any">, number> = {
  today: 0,
  week: 7,
  month: 30,
  "3months": 90,
};

// Evergreen quests (no eventDate) always match, whatever range is picked -
// the filter only narrows down one-time dated events.
export function questMatchesDateRange(eventDate: string | undefined, range: DateRange): boolean {
  if (range === "any" || !eventDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(eventDate);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (days < 0) return false;
  return days <= DATE_RANGE_MAX_DAYS[range];
}

// Personal exclusion preferences ("never show me this"), set once on a
// profile rather than re-picked every session like the Discover filters.
// Matches against a quest's free-text tags, so adding a new preference here
// doesn't require a data-model change - just a set of tag keywords to catch.
export interface PreferenceOption {
  id: string;
  label: string;
  icon: string;
  matchTags: string[];
}

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: "no-alcohol", label: "Geen alcohol", icon: "wine-outline", matchTags: ["bier", "wijn", "borrel", "cocktail", "jenever", "alcohol"] },
  { id: "no-pets", label: "Geen huisdieren", icon: "paw-outline", matchTags: ["huisdieren", "dieren"] },
];

export interface UserProfile {
  name: string;
  excludedPreferenceIds: string[];
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  excludedPreferenceIds: [],
};

export function questMatchesPreferences(tags: string[], excludedIds: string[]): boolean {
  if (excludedIds.length === 0) return true;
  const lowerTags = tags.map((t) => t.toLowerCase());
  return !excludedIds.some((id) => {
    const pref = PREFERENCE_OPTIONS.find((p) => p.id === id);
    return pref?.matchTags.some((mt) => lowerTags.some((tag) => tag.includes(mt)));
  });
}

export type GroupLabel = "SOLO" | "DUO" | "GROUP" | "COMMUNITY";

// Derives which of the solo/duo/group/community badges apply to a quest's
// group-size range, per the card spec in the branding briefing.
export function groupLabels(minGroupSize: number, maxGroupSize: number): GroupLabel[] {
  const labels: GroupLabel[] = [];
  if (minGroupSize <= 1) labels.push("SOLO");
  if (minGroupSize <= 2 && maxGroupSize >= 2) labels.push("DUO");
  if (maxGroupSize >= 3 && maxGroupSize < 15) labels.push("GROUP");
  if (maxGroupSize >= 15) labels.push("COMMUNITY");
  return labels;
}
