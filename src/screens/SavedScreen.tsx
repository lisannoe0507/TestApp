import React, { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import QuestMapModal from "../components/QuestMapModal";
import { CATEGORY_LABELS, QuestWithDistance } from "../types";
import { colors, categoryColors, fontFamily, radius } from "../theme";

export default function SavedScreen() {
  const { savedQuests, removeSaved } = useApp();
  const [mapQuest, setMapQuest] = useState<QuestWithDistance | null>(null);

  const renderItem = ({ item }: { item: QuestWithDistance }) => {
    const accent = categoryColors[item.category];
    return (
      <TouchableOpacity style={styles.card} onPress={() => setMapQuest(item)} activeOpacity={0.8}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
        <View style={styles.cardBody}>
          <Text style={[styles.category, { color: accent }]}>{CATEGORY_LABELS[item.category]}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.city}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{item.distanceKm === null ? "? km" : `${item.distanceKm.toFixed(1)} km`}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{item.price === 0 ? "Gratis" : `€${item.price}`}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={() => removeSaved(item.id)}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Opgeslagen</Text>
      {savedQuests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>Nog niets opgeslagen. Swipe rechts op iets leuks!</Text>
        </View>
      ) : (
        <FlatList
          data={savedQuests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      <QuestMapModal quest={mapQuest} onClose={() => setMapQuest(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.text,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginBottom: 12,
    overflow: "hidden",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: {
    width: 72,
    height: 72,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 12,
  },
  category: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    color: colors.text,
    fontSize: 16,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 12,
  },
  metaDot: {
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  removeButton: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
});
