import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { PREFERENCE_OPTIONS } from "../types";
import { colors, fontFamily, radius } from "../theme";

export default function ProfileScreen() {
  const { profile, setProfile } = useApp();
  const [name, setName] = useState(profile.name);

  const togglePreference = (id: string) => {
    const has = profile.excludedPreferenceIds.includes(id);
    const next = has
      ? profile.excludedPreferenceIds.filter((p) => p !== id)
      : [...profile.excludedPreferenceIds, id];
    setProfile({ ...profile, excludedPreferenceIds: next });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Profiel</Text>

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.surface} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Naam</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={() => setProfile({ ...profile, name })}
          placeholder="Hoe mogen we je noemen?"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Nooit tonen</Text>
        <Text style={styles.sectionSubtitle}>
          Activiteiten met deze kenmerken zie je nooit in je feed, ongeacht je filters.
        </Text>
        <View style={styles.prefList}>
          {PREFERENCE_OPTIONS.map((pref) => {
            const active = profile.excludedPreferenceIds.includes(pref.id);
            return (
              <TouchableOpacity
                key={pref.id}
                style={[styles.prefRow, active && styles.prefRowActive]}
                onPress={() => togglePreference(pref.id)}
              >
                <Ionicons name={pref.icon as any} size={20} color={active ? colors.brand : colors.textMuted} />
                <Text style={[styles.prefLabel, active && styles.prefLabelActive]}>{pref.label}</Text>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active && <Ionicons name="checkmark" size={14} color={colors.surface} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.footnote}>
          Wil je zien wat er precies gebeurt met afstand, prijs, categorieën of datum? Tik op het
          filter-icoon boven de swipe-kaarten in Ontdekken.
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
  avatarWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    color: colors.text,
    fontSize: 15,
    marginTop: 20,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  input: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  prefList: {
    marginTop: 12,
    gap: 10,
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  prefRowActive: {
    borderColor: colors.brand,
  },
  prefLabel: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  prefLabelActive: {
    color: colors.brand,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  footnote: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 28,
    lineHeight: 18,
    textAlign: "center",
  },
});
