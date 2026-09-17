// Design tokens for Side Quest's brand palette (2026-09-17 revision):
// vivid orange as the primary action color, blues for structure/navigation.

export const colors = {
  background: "#F5F9FB", // very light blue-white
  surface: "#FFFFFF",
  text: "#0B1B33", // near-black, blue-leaning for readability
  textMuted: "#5B6B7C",
  border: "#E1E8ED",

  brand: "#FF6D00", // orange - primary CTA, swipe/save actions, highlights, logo accent
  secondary: "#0077B6", // blue - navigation, filters, secondary buttons, trust/structure
  accentLight: "#00B4D8", // light blue - fresh accents, discovery, community sections
  highlight: "#FF9E00", // amber - used sparingly for tags/new-quest highlights
  deep: "#023E8A", // dark blue - depth, contrast moments, dark headers
  teal: "#2A9D8F", // sixth category accent (Eat & Drink) - distinct from the orange/blue family
  plum: "#7B2CBF", // seventh category accent (Shop)

  success: "#0077B6",
  danger: "#FF6D00",
} as const;

// Category accents stay subtle - a label/badge tint, never the whole UI.
export const categoryColors: Record<string, string> = {
  learn: colors.secondary,
  create: colors.highlight,
  move: colors.accentLight,
  explore: colors.deep,
  connect: colors.brand,
  eatdrink: colors.teal,
  shop: colors.plum,
};

export const radius = {
  card: 20,
  chip: 20,
  button: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontFamily = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semiBold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
};
