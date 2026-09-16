import { Quest } from "../types";
import { MOCK_QUESTS } from "./quests";

// Web preview only (expo-sqlite doesn't bundle for web without extra wasm
// asset config). Native builds use db.ts; this file is picked up
// automatically by Metro's platform resolution for --platform web.
let quests: Quest[] = [...MOCK_QUESTS];

export async function getAllQuests(): Promise<Quest[]> {
  return quests;
}

export async function addQuest(quest: Omit<Quest, "id">): Promise<Quest> {
  const newQuest = { ...quest, id: `local-${Date.now()}` };
  quests = [newQuest, ...quests];
  return newQuest;
}

export async function deleteQuest(id: string): Promise<void> {
  quests = quests.filter((q) => q.id !== id);
}
