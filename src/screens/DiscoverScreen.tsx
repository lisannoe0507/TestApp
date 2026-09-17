import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import QuestCard from "../components/QuestCard";
import { useApp } from "../context/AppContext";

export default function DiscoverScreen() {
  const { deck, likeQuest, passQuest, resetDeck, locationStatus, requestLocation } = useApp();
  const visible = deck.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Side Quest</Text>
        <Text style={styles.subtitle}>Swipe voor je volgende avontuur</Text>
      </View>

      {(locationStatus === "denied" || locationStatus === "unavailable") && (
        <TouchableOpacity style={styles.locationBanner} onPress={requestLocation}>
          <Ionicons name="location-outline" size={16} color="#FCD34D" />
          <Text style={styles.locationBannerText}>
            Locatie niet beschikbaar — afstanden zijn onbekend. Tik om opnieuw te proberen.
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.deckArea}>
        {visible.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="compass-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Geen quests meer!</Text>
            <Text style={styles.emptyText}>
              Je hebt alles gezien binnen je huidige filters. Pas je instellingen aan of begin opnieuw.
            </Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetDeck}>
              <Text style={styles.resetButtonText}>Begin opnieuw</Text>
            </TouchableOpacity>
          </View>
        ) : (
          visible
            .map((quest, index) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isTop={index === 0}
                stackIndex={index}
                onSwipeLeft={() => passQuest(quest)}
                onSwipeRight={() => likeQuest(quest)}
              />
            ))
            .reverse()
        )}
      </View>

      {visible.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => passQuest(visible[0])}
          >
            <Ionicons name="close" size={32} color="#F87171" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => likeQuest(visible[0])}
          >
            <Ionicons name="heart" size={28} color="#4ADE80" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 2,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292515",
    marginHorizontal: 24,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  locationBannerText: {
    color: "#FCD34D",
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
  },
  deckArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    paddingBottom: 28,
    paddingTop: 12,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1c1c1e",
    marginHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  passButton: {},
  likeButton: {},
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
