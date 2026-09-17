import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_LABELS, Quest } from "../types";
import { colors, categoryColors, fontFamily, radius } from "../theme";

interface Props {
  quest: Quest | null;
  onClose: () => void;
}

// Web preview only — react-native-maps has no web target here. Native
// (iOS/Android) builds use QuestMapModal.tsx via Metro's platform
// resolution.
export default function QuestMapModal({ quest, onClose }: Props) {
  if (!quest) return null;
  const accent = categoryColors[quest.category];

  return (
    <Modal visible={!!quest} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={40} color={colors.textMuted} />
          <Text style={styles.placeholderText}>Kaart alleen beschikbaar in de iOS/Android-app</Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={[styles.categoryBadge, { backgroundColor: accent + "26" }]}>
            <Text style={[styles.categoryBadgeText, { color: accent }]}>{CATEGORY_LABELS[quest.category]}</Text>
          </View>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.city}>{quest.city}</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeholderText: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 13,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 2,
  },
  city: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
