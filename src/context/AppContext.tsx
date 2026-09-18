import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import {
  CATEGORY_LABELS,
  DATE_RANGE_LABELS,
  DEFAULT_FILTERS,
  DEFAULT_PROFILE,
  FilterSettings,
  PREFERENCE_OPTIONS,
  Quest,
  QuestWithDistance,
  UserProfile,
  questMatchesDateRange,
  questMatchesPreferences,
} from "../types";
import { getAllQuests } from "../data/db";
import { haversineKm } from "../utils/location";

const FILTERS_KEY = "sidequest.filters";
const SAVED_KEY = "sidequest.saved";
const SEEN_KEY = "sidequest.seen";
const PROFILE_KEY = "sidequest.profile";

type LocationStatus = "pending" | "granted" | "denied" | "unavailable";

interface AppContextValue {
  filters: FilterSettings;
  setFilters: (f: FilterSettings) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  savedQuests: QuestWithDistance[];
  seenIds: string[];
  deck: QuestWithDistance[];
  likeQuest: (quest: QuestWithDistance) => void;
  passQuest: (quest: QuestWithDistance) => void;
  removeSaved: (id: string) => void;
  resetDeck: () => void;
  loading: boolean;
  refreshQuests: () => Promise<void>;
  locationStatus: LocationStatus;
  requestLocation: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// getCurrentPositionAsync is known to hang indefinitely on some Android
// devices (expo/expo#39851) — never await it without a timeout.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("location timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

// A previously stored FilterSettings can reference a category taxonomy that
// no longer exists (e.g. after the Learn/Create/Move/Explore/Connect
// rebrand) — drop unknown categories and fall back to the defaults if none
// of the stored ones are valid, so the deck doesn't silently end up empty.
function sanitizeFilters(stored: FilterSettings): FilterSettings {
  const validCategories = stored.categories.filter((c) => c in CATEGORY_LABELS);
  return {
    ...stored,
    categories: validCategories.length > 0 ? validCategories : DEFAULT_FILTERS.categories,
    dateRange: stored.dateRange in DATE_RANGE_LABELS ? stored.dateRange : DEFAULT_FILTERS.dateRange,
  };
}

function sanitizeProfile(stored: UserProfile): UserProfile {
  const validIds = new Set(PREFERENCE_OPTIONS.map((p) => p.id));
  return {
    name: typeof stored.name === "string" ? stored.name : "",
    excludedPreferenceIds: (stored.excludedPreferenceIds ?? []).filter((id) => validIds.has(id)),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savedQuests, setSavedQuests] = useState<QuestWithDistance[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("pending");

  useEffect(() => {
    (async () => {
      try {
        const [rawFilters, rawProfile, rawSaved, rawSeen, quests] = await Promise.all([
          AsyncStorage.getItem(FILTERS_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(SEEN_KEY),
          getAllQuests(),
        ]);
        if (rawFilters) setFiltersState(sanitizeFilters(JSON.parse(rawFilters)));
        if (rawProfile) setProfileState(sanitizeProfile(JSON.parse(rawProfile)));
        if (rawSaved) setSavedQuests(JSON.parse(rawSaved));
        if (rawSeen) setSeenIds(JSON.parse(rawSeen));
        setAllQuests(quests);
      } catch (e) {
        console.error("[sidequest] failed to load app data:", e);
      } finally {
        setLoading(false);
      }
    })();
    requestLocation();
  }, []);

  const requestLocation = () => {
    setLocationStatus("pending");
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationStatus("denied");
          return;
        }
        const position = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          10000
        );
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationStatus("granted");
      } catch (e) {
        setLocationStatus("unavailable");
      }
    })();
  };

  const refreshQuests = async () => {
    setAllQuests(await getAllQuests());
  };

  const setFilters = (f: FilterSettings) => {
    setFiltersState(f);
    AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(f)).catch(() => {});
  };

  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p)).catch(() => {});
  };

  const likeQuest = (quest: QuestWithDistance) => {
    setSavedQuests((prev) => {
      if (prev.some((q) => q.id === quest.id)) return prev;
      const next = [quest, ...prev];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    markSeen(quest.id);
  };

  const passQuest = (quest: QuestWithDistance) => {
    markSeen(quest.id);
  };

  const markSeen = (id: string) => {
    setSeenIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const removeSaved = (id: string) => {
    setSavedQuests((prev) => {
      const next = prev.filter((q) => q.id !== id);
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const resetDeck = () => {
    setSeenIds([]);
    AsyncStorage.setItem(SEEN_KEY, JSON.stringify([])).catch(() => {});
  };

  // Shuffled once per quest load (not on every filter/swipe change) so
  // categories are mixed through the deck instead of appearing back-to-back
  // in the source array's order, while staying stable within a session.
  const shuffledQuests = useMemo(() => {
    const arr = [...allQuests];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [allQuests]);

  const deck = useMemo(() => {
    const withDistance: QuestWithDistance[] = shuffledQuests.map((q) => ({
      ...q,
      distanceKm: userLocation ? haversineKm(userLocation.latitude, userLocation.longitude, q.latitude, q.longitude) : null,
    }));

    return withDistance.filter((q) => {
      if (seenIds.includes(q.id)) return false;
      if (!filters.categories.includes(q.category)) return false;
      if (q.distanceKm !== null && q.distanceKm > filters.maxDistanceKm) return false;
      if (q.price > filters.maxPrice) return false;
      if (filters.groupSize < q.minGroupSize || filters.groupSize > q.maxGroupSize) return false;
      if (!questMatchesDateRange(q.eventDate, filters.dateRange)) return false;
      if (!questMatchesPreferences(q.tags, profile.excludedPreferenceIds)) return false;
      return true;
    });
  }, [filters, seenIds, shuffledQuests, userLocation, profile.excludedPreferenceIds]);

  return (
    <AppContext.Provider
      value={{
        filters,
        setFilters,
        profile,
        setProfile,
        savedQuests,
        seenIds,
        deck,
        likeQuest,
        passQuest,
        removeSaved,
        resetDeck,
        loading,
        refreshQuests,
        locationStatus,
        requestLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
