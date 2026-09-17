import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useApp } from "../context/AppContext";
import { CATEGORY_LABELS, Category } from "../types";
import { colors, categoryColors, fontFamily, radius } from "../theme";

const ALL_CATEGORIES: Category[] = ["learn", "create", "move", "explore", "connect"];

export default function SettingsScreen() {
  const { filters, setFilters, resetDeck } = useApp();

  const toggleCategory = (cat: Category) => {
    const has = filters.categories.includes(cat);
    const next = has ? filters.categories.filter((c) => c !== cat) : [...filters.categories, cat];
    if (next.length === 0) return; // keep at least one category selected
    setFilters({ ...filters, categories: next });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Instellingen</Text>

        <Text style={styles.sectionTitle}>Maximale afstand</Text>
        <Text style={styles.sectionValue}>{filters.maxDistanceKm} km</Text>
        <Slider
          minimumValue={1}
          maximumValue={50}
          step={1}
          value={filters.maxDistanceKm}
          onSlidingComplete={(v) => setFilters({ ...filters, maxDistanceKm: Math.round(v) })}
          minimumTrackTintColor={colors.brand}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.brand}
        />

        <Text style={styles.sectionTitle}>Maximale prijs per persoon</Text>
        <Text style={styles.sectionValue}>{filters.maxPrice === 0 ? "Gratis" : `€${filters.maxPrice}`}</Text>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={5}
          value={filters.maxPrice}
          onSlidingComplete={(v) => setFilters({ ...filters, maxPrice: Math.round(v) })}
          minimumTrackTintColor={colors.brand}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.brand}
        />

        <Text style={styles.sectionTitle}>Aantal personen</Text>
        <Text style={styles.sectionValue}>{filters.groupSize} {filters.groupSize === 1 ? "persoon" : "personen"}</Text>
        <Slider
          minimumValue={1}
          maximumValue={12}
          step={1}
          value={filters.groupSize}
          onSlidingComplete={(v) => setFilters({ ...filters, groupSize: Math.round(v) })}
          minimumTrackTintColor={colors.brand}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.brand}
        />

        <Text style={styles.sectionTitle}>Categorieën</Text>
        <View style={styles.chipRow}>
          {ALL_CATEGORIES.map((cat) => {
            const active = filters.categories.includes(cat);
            const accent = categoryColors[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetDeck}>
          <Text style={styles.resetButtonText}>Reset geziene quests</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Side Quest gebruikt momenteel een eigen, handmatig samengestelde database met echte
          plekken in Groningen. Later koppelen we live bronnen (Google Places, Ticketmaster,
          Eventbrite, ...) als aanvulling — niet als vervanging.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    color: colors.text,
    fontSize: 15,
    marginTop: 20,
  },
  sectionValue: {
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.surface,
  },
  resetButton: {
    marginTop: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: "center",
  },
  resetButtonText: {
    fontFamily: fontFamily.semiBold,
    color: colors.text,
  },
  footnote: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
    textAlign: "center",
  },
});
