import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { CATEGORY_LABELS, DEFAULT_FILTERS, FilterSettings, Quest, QuestWithDistance } from "../types";
import { getAllQuests } from "../data/db";
import { haversineKm } from "../utils/location";

const FILTERS_KEY = "sidequest.filters";
const SAVED_KEY = "sidequest.saved";
const SEEN_KEY = "sidequest.seen";

type LocationStatus = "pending" | "granted" | "denied" | "unavailable";

interface AppContextValue {
  filters: FilterSettings;
  setFilters: (f: FilterSettings) => void;
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
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [savedQuests, setSavedQuests] = useState<QuestWithDistance[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("pending");

  useEffect(() => {
    (async () => {
      try {
        const [rawFilters, rawSaved, rawSeen, quests] = await Promise.all([
          AsyncStorage.getItem(FILTERS_KEY),
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(SEEN_KEY),
          getAllQuests(),
        ]);
        if (rawFilters) setFiltersState(sanitizeFilters(JSON.parse(rawFilters)));
        if (rawSaved) setSavedQuests(JSON.parse(rawSaved));
        if (rawSeen) setSeenIds(JSON.parse(rawSeen));
        console.log("[sidequest] loaded quests:", quests.length);
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

  const deck = useMemo(() => {
    const withDistance: QuestWithDistance[] = allQuests.map((q) => ({
      ...q,
      distanceKm: userLocation ? haversineKm(userLocation.latitude, userLocation.longitude, q.latitude, q.longitude) : null,
    }));

    return withDistance.filter((q) => {
      if (seenIds.includes(q.id)) return false;
      if (!filters.categories.includes(q.category)) return false;
      if (q.distanceKm !== null && q.distanceKm > filters.maxDistanceKm) return false;
      if (q.price > filters.maxPrice) return false;
      if (filters.groupSize < q.minGroupSize || filters.groupSize > q.maxGroupSize) return false;
      return true;
    });
  }, [filters, seenIds, allQuests, userLocation]);

  return (
    <AppContext.Provider
      value={{
        filters,
        setFilters,
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
