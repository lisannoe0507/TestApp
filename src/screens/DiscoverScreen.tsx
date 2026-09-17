import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import QuestCard from "../components/QuestCard";
import FiltersModal from "../components/FiltersModal";
import { useApp } from "../context/AppContext";
import { colors, fontFamily, radius } from "../theme";

export default function DiscoverScreen() {
  const { deck, likeQuest, passQuest, resetDeck, locationStatus, requestLocation } = useApp();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const visible = deck.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.logo}>
              <Text style={{ color: colors.brand }}>Side</Text>
              <Text style={{ color: colors.secondary }}> Quest</Text>
            </Text>
            <Text style={styles.subtitle}>What will you try next?</Text>
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFiltersVisible(true)}>
            <Ionicons name="options-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <FiltersModal visible={filtersVisible} onClose={() => setFiltersVisible(false)} />

      {(locationStatus === "denied" || locationStatus === "unavailable") && (
        <TouchableOpacity style={styles.locationBanner} onPress={requestLocation}>
          <Ionicons name="navigate-outline" size={16} color={colors.secondary} />
          <Text style={styles.locationBannerText}>
            Locatie niet beschikbaar — afstanden zijn onbekend. Tik om opnieuw te proberen.
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.deckArea}>
        {visible.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-branch-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Even niets nieuws hier</Text>
            <Text style={styles.emptyText}>
              Je hebt alles gezien binnen je huidige filters. Pas ze aan, of begin opnieuw.
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setFiltersVisible(true)}>
                <Text style={styles.secondaryButtonText}>Filters aanpassen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={resetDeck}>
                <Text style={styles.resetButtonText}>Begin opnieuw</Text>
              </TouchableOpacity>
            </View>
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
            style={[styles.actionButton, { borderColor: colors.secondary }]}
            onPress={() => passQuest(visible[0])}
          >
            <Ionicons name="close" size={26} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.brand }]}
            onPress={() => likeQuest(visible[0])}
          >
            <Ionicons name="bookmark" size={22} color={colors.brand} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary + "1A",
    marginHorizontal: 24,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  locationBannerText: {
    fontFamily: fontFamily.regular,
    color: colors.text,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    marginHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    color: colors.text,
    fontSize: 19,
    marginTop: 16,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.button,
  },
  secondaryButtonText: {
    fontFamily: fontFamily.semiBold,
    color: colors.text,
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.button,
  },
  resetButtonText: {
    fontFamily: fontFamily.semiBold,
    color: colors.surface,
    fontSize: 15,
  },
});
