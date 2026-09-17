import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { CATEGORY_LABELS, QuestWithDistance } from "../types";

export default function SavedScreen() {
  const { savedQuests, removeSaved } = useApp();

  const renderItem = ({ item }: { item: QuestWithDistance }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
      <View style={styles.cardBody}>
        <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
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
        <Ionicons name="trash-outline" size={20} color="#F87171" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Opgeslagen</Text>
      {savedQuests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={56} color="#9ca3af" />
          <Text style={styles.emptyText}>Nog niets opgeslagen. Swipe naar rechts op iets leuks!</Text>
        </View>
      ) : (
        <FlatList
          data={savedQuests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0f",
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
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
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    alignItems: "center",
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
    color: "#818cf8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  metaDot: {
    color: "#9ca3af",
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
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
});
