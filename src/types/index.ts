export type Category = "event" | "course" | "restaurant" | "location";

export interface Quest {
  id: string;
  category: Category;
  title: string;
  description: string;
  imageUrl: string;
  price: number; // 0 = free, in euros
  distanceKm: number;
  minGroupSize: number;
  maxGroupSize: number;
  city: string;
  tags: string[];
  rating: number; // 0-5
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
  categories: ["event", "course", "restaurant", "location"],
};

export const CATEGORY_LABELS: Record<Category, string> = {
  event: "Evenement",
  course: "Cursus",
  restaurant: "Restaurant",
  location: "Locatie",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  event: "calendar",
  course: "school",
  restaurant: "restaurant",
  location: "location",
};
