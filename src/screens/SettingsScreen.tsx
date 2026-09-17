import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useApp } from "../context/AppContext";
import { CATEGORY_LABELS, Category } from "../types";

const ALL_CATEGORIES: Category[] = ["event", "course", "restaurant", "location"];

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
          minimumTrackTintColor="#6366F1"
          maximumTrackTintColor="#2c2c2e"
          thumbTintColor="#6366F1"
        />

        <Text style={styles.sectionTitle}>Maximale prijs per persoon</Text>
        <Text style={styles.sectionValue}>{filters.maxPrice === 0 ? "Gratis" : `€${filters.maxPrice}`}</Text>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={5}
          value={filters.maxPrice}
          onSlidingComplete={(v) => setFilters({ ...filters, maxPrice: Math.round(v) })}
          minimumTrackTintColor="#6366F1"
          maximumTrackTintColor="#2c2c2e"
          thumbTintColor="#6366F1"
        />

        <Text style={styles.sectionTitle}>Aantal personen</Text>
        <Text style={styles.sectionValue}>{filters.groupSize} {filters.groupSize === 1 ? "persoon" : "personen"}</Text>
        <Slider
          minimumValue={1}
          maximumValue={12}
          step={1}
          value={filters.groupSize}
          onSlidingComplete={(v) => setFilters({ ...filters, groupSize: Math.round(v) })}
          minimumTrackTintColor="#6366F1"
          maximumTrackTintColor="#2c2c2e"
          thumbTintColor="#6366F1"
        />

        <Text style={styles.sectionTitle}>Categorieën</Text>
        <View style={styles.chipRow}>
          {ALL_CATEGORIES.map((cat) => {
            const active = filters.categories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && styles.chipActive]}
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
          Side Quest gebruikt momenteel voorbeelddata. Koppel je eigen API-key (Google Places,
          Ticketmaster, Eventbrite, ...) om live aanbevelingen te tonen.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0f",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
  },
  sectionValue: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 20,
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#2c2c2e",
    marginRight: 10,
    marginBottom: 10,
  },
  chipActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  chipText: {
    color: "#9ca3af",
    fontWeight: "600",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#fff",
  },
  resetButton: {
    marginTop: 32,
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#2c2c2e",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  footnote: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
    textAlign: "center",
  },
});
