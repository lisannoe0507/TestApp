import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_FILTERS, FilterSettings, Quest } from "../types";
import { getAllQuests } from "../data/db";

const FILTERS_KEY = "sidequest.filters";
const SAVED_KEY = "sidequest.saved";
const SEEN_KEY = "sidequest.seen";

interface AppContextValue {
  filters: FilterSettings;
  setFilters: (f: FilterSettings) => void;
  savedQuests: Quest[];
  seenIds: string[];
  deck: Quest[];
  likeQuest: (quest: Quest) => void;
  passQuest: (quest: Quest) => void;
  removeSaved: (id: string) => void;
  resetDeck: () => void;
  loading: boolean;
  refreshQuests: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [savedQuests, setSavedQuests] = useState<Quest[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rawFilters, rawSaved, rawSeen, quests] = await Promise.all([
          AsyncStorage.getItem(FILTERS_KEY),
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(SEEN_KEY),
          getAllQuests(),
        ]);
        if (rawFilters) setFiltersState(JSON.parse(rawFilters));
        if (rawSaved) setSavedQuests(JSON.parse(rawSaved));
        if (rawSeen) setSeenIds(JSON.parse(rawSeen));
        setAllQuests(quests);
      } catch (e) {
        // Ignore corrupted local storage and start fresh.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshQuests = async () => {
    setAllQuests(await getAllQuests());
  };

  const setFilters = (f: FilterSettings) => {
    setFiltersState(f);
    AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(f)).catch(() => {});
  };

  const likeQuest = (quest: Quest) => {
    setSavedQuests((prev) => {
      if (prev.some((q) => q.id === quest.id)) return prev;
      const next = [quest, ...prev];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    markSeen(quest.id);
  };

  const passQuest = (quest: Quest) => {
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
    return allQuests.filter((q) => {
      if (seenIds.includes(q.id)) return false;
      if (!filters.categories.includes(q.category)) return false;
      if (q.distanceKm > filters.maxDistanceKm) return false;
      if (q.price > filters.maxPrice) return false;
      if (filters.groupSize < q.minGroupSize || filters.groupSize > q.maxGroupSize) return false;
      return true;
    });
  }, [filters, seenIds, allQuests]);

  return (
    <AppContext.Provider
      value={{ filters, setFilters, savedQuests, seenIds, deck, likeQuest, passQuest, removeSaved, resetDeck, loading, refreshQuests }}
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
