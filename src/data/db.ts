import * as SQLite from "expo-sqlite";
import { Quest, Category, CATEGORY_LABELS } from "../types";
import { MOCK_QUESTS } from "./quests";

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_LABELS));

// On-device SQLite database — no external account or service needed.
// Holds the activity catalog ("quests") so new items can be added without
// rebuilding the app (see addQuest below). User prefs (filters/saved/seen)
// stay in AsyncStorage; this file only owns the content catalog.

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("sidequest.db");
  }
  return dbPromise;
}

async function ensureInitialized() {
  const db = await getDb();

  // Drop and reseed the table if it still has the old (pre-GPS) schema, or
  // if it has rows from before the Learn/Create/Move/Explore/Connect
  // rebrand — those ids already exist, so INSERT OR IGNORE below would
  // never touch their now-stale category values otherwise.
  const existingColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(quests)");
  const tableExists = existingColumns.length > 0;
  const hasLatitude = existingColumns.some((c) => c.name === "latitude");

  let needsReset = tableExists && !hasLatitude;
  if (tableExists && hasLatitude) {
    const categoryRows = await db.getAllAsync<{ category: string }>("SELECT DISTINCT category FROM quests");
    needsReset = categoryRows.some((r) => !VALID_CATEGORIES.has(r.category));
  }
  if (needsReset) {
    await db.execAsync("DROP TABLE quests");
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      price REAL NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      min_group_size INTEGER NOT NULL,
      max_group_size INTEGER NOT NULL,
      city TEXT NOT NULL,
      tags TEXT NOT NULL,
      rating REAL NOT NULL
    );
  `);

  const row = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM quests");
  if (!row || row.count === 0) {
    await seedQuests(MOCK_QUESTS);
  }
}

async function seedQuests(quests: Quest[]) {
  const db = await getDb();
  for (const q of quests) {
    await db.runAsync(
      `INSERT OR IGNORE INTO quests
        (id, category, title, description, image_url, price, latitude, longitude, min_group_size, max_group_size, city, tags, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.id, q.category, q.title, q.description, q.imageUrl, q.price, q.latitude, q.longitude, q.minGroupSize, q.maxGroupSize, q.city, JSON.stringify(q.tags), q.rating]
    );
  }
}

function rowToQuest(row: any): Quest {
  return {
    id: row.id,
    category: row.category as Category,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    price: row.price,
    latitude: row.latitude,
    longitude: row.longitude,
    minGroupSize: row.min_group_size,
    maxGroupSize: row.max_group_size,
    city: row.city,
    tags: JSON.parse(row.tags),
    rating: row.rating,
  };
}

export async function getAllQuests(): Promise<Quest[]> {
  await ensureInitialized();
  const db = await getDb();
  const rows = await db.getAllAsync<any>("SELECT * FROM quests ORDER BY rowid DESC");
  return rows.map(rowToQuest);
}

export async function addQuest(quest: Omit<Quest, "id">): Promise<Quest> {
  const db = await getDb();
  const id = `local-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  await db.runAsync(
    `INSERT INTO quests
      (id, category, title, description, image_url, price, latitude, longitude, min_group_size, max_group_size, city, tags, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, quest.category, quest.title, quest.description, quest.imageUrl, quest.price, quest.latitude, quest.longitude, quest.minGroupSize, quest.maxGroupSize, quest.city, JSON.stringify(quest.tags), quest.rating]
  );
  return { ...quest, id };
}

export async function deleteQuest(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM quests WHERE id = ?", [id]);
}
