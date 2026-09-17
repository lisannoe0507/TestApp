import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useApp } from "../context/AppContext";
import { CATEGORY_LABELS, Category, DATE_RANGE_LABELS, DateRange } from "../types";
import { colors, categoryColors, fontFamily, radius } from "../theme";

const ALL_CATEGORIES: Category[] = ["learn", "create", "move", "explore", "connect", "eatdrink", "shop"];
const ALL_DATE_RANGES: DateRange[] = ["any", "today", "week", "month", "3months"];

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Filters live behind this modal, reached via a small icon on Discover,
// rather than a permanent tab — the app is meant to feel like random
// discovery first, with filtering as an occasional adjustment, not the
// main event.
export default function FiltersModal({ visible, onClose }: Props) {
  const { filters, setFilters, resetDeck } = useApp();

  const toggleCategory = (cat: Category) => {
    const has = filters.categories.includes(cat);
    const next = has ? filters.categories.filter((c) => c !== cat) : [...filters.categories, cat];
    if (next.length === 0) return; // keep at least one category selected
    setFilters({ ...filters, categories: next });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

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
          <Text style={styles.sectionValue}>
            {filters.groupSize} {filters.groupSize === 1 ? "persoon" : "personen"}
          </Text>
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
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{CATEGORY_LABELS[cat]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Wanneer</Text>
          <View style={styles.chipRow}>
            {ALL_DATE_RANGES.map((range) => {
              const active = filters.dateRange === range;
              return (
                <TouchableOpacity
                  key={range}
                  style={[styles.chip, active && { backgroundColor: colors.brand, borderColor: colors.brand }]}
                  onPress={() => setFilters({ ...filters, dateRange: range })}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{DATE_RANGE_LABELS[range]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.hint}>
            Geldt alleen voor activiteiten met een vaste datum (zoals een concert of festival) —
            plekken en cursussen zonder vaste datum blijven altijd zichtbaar.
          </Text>

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
    </Modal>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  header: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
  hint: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 17,
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
