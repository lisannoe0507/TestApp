export type Category = "learn" | "create" | "move" | "explore" | "connect";

export interface Quest {
  id: string;
  category: Category;
  title: string;
  description: string;
  imageUrl: string;
  price: number; // 0 = free, in euros
  durationMinutes?: number;
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

export interface FilterSettings {
  maxDistanceKm: number;
  maxPrice: number;
  groupSize: number;
  categories: Category[];
}

export const DEFAULT_FILTERS: FilterSettings = {
  maxDistanceKm: 25,
  maxPrice: 50,
  groupSize: 2,
  categories: ["learn", "create", "move", "explore", "connect"],
};

// Brand category tokens stay in English per the branding briefing, even
// inside the otherwise Dutch UI - they read as brand vocabulary, not copy.
export const CATEGORY_LABELS: Record<Category, string> = {
  learn: "Learn",
  create: "Create",
  move: "Move",
  explore: "Explore",
  connect: "Connect",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  learn: "book-outline",
  create: "color-palette-outline",
  move: "footsteps-outline",
  explore: "telescope-outline",
  connect: "people-outline",
};

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
