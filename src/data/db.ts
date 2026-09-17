import * as SQLite from "expo-sqlite";
import { Quest, Category } from "../types";
import { MOCK_QUESTS } from "./quests";

// On-device SQLite database — no external account or service needed.
// Holds the activity catalog ("quests") so new items can be added without
// rebuilding the app (see addQuest below). User prefs (filters/saved/seen)
// stay in AsyncStorage; this file only owns the content catalog.
//
// The built-in catalog (MOCK_QUESTS) is treated as the source of truth and
// is fully re-synced (upsert + delete-removed) on every load — earlier this
// only seeded once and silently ignored later edits to already-seeded rows
// (a content-only change, like a category rename, would never reach devices
// that had already seeded the old value). User-added quests (addQuest, ids
// prefixed "local-") are never touched by the sync.

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("sidequest.db");
  }
  return dbPromise;
}

async function ensureInitialized() {
  const db = await getDb();

  // Drop the table if it still has the old (pre-GPS) schema, so it gets
  // recreated with latitude/longitude below.
  const existingColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(quests)");
  if (existingColumns.length > 0 && !existingColumns.some((c) => c.name === "latitude")) {
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
      duration_minutes INTEGER,
      event_date TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      min_group_size INTEGER NOT NULL,
      max_group_size INTEGER NOT NULL,
      city TEXT NOT NULL,
      tags TEXT NOT NULL,
      rating REAL NOT NULL
    );
  `);

  // duration_minutes/event_date were added after the table could already
  // exist without them.
  const columns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(quests)");
  const columnNames = new Set(columns.map((c) => c.name));
  if (!columnNames.has("duration_minutes")) {
    await db.execAsync("ALTER TABLE quests ADD COLUMN duration_minutes INTEGER");
  }
  if (!columnNames.has("event_date")) {
    await db.execAsync("ALTER TABLE quests ADD COLUMN event_date TEXT");
  }

  await syncBuiltInQuests();
}

async function syncBuiltInQuests() {
  const db = await getDb();
  for (const q of MOCK_QUESTS) {
    await db.runAsync(
      `INSERT OR REPLACE INTO quests
        (id, category, title, description, image_url, price, duration_minutes, event_date, latitude, longitude, min_group_size, max_group_size, city, tags, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        q.id,
        q.category,
        q.title,
        q.description,
        q.imageUrl,
        q.price,
        q.durationMinutes ?? null,
        q.eventDate ?? null,
        q.latitude,
        q.longitude,
        q.minGroupSize,
        q.maxGroupSize,
        q.city,
        JSON.stringify(q.tags),
        q.rating,
      ]
    );
  }
  // Drop built-in rows that no longer exist in MOCK_QUESTS, without
  // touching user-added ones (addQuest ids are prefixed "local-").
  const currentIds = MOCK_QUESTS.map((q) => q.id);
  const placeholders = currentIds.map(() => "?").join(",");
  await db.runAsync(
    `DELETE FROM quests WHERE id NOT LIKE 'local-%' AND id NOT IN (${placeholders})`,
    currentIds
  );
}

function rowToQuest(row: any): Quest {
  return {
    id: row.id,
    category: row.category as Category,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    price: row.price,
    durationMinutes: row.duration_minutes ?? undefined,
    eventDate: row.event_date ?? undefined,
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
      (id, category, title, description, image_url, price, duration_minutes, event_date, latitude, longitude, min_group_size, max_group_size, city, tags, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      quest.category,
      quest.title,
      quest.description,
      quest.imageUrl,
      quest.price,
      quest.durationMinutes ?? null,
      quest.eventDate ?? null,
      quest.latitude,
      quest.longitude,
      quest.minGroupSize,
      quest.maxGroupSize,
      quest.city,
      JSON.stringify(quest.tags),
      quest.rating,
    ]
  );
  return { ...quest, id };
}

export async function deleteQuest(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM quests WHERE id = ?", [id]);
}
