import * as SQLite from 'expo-sqlite';
import type { ThemeMode } from '@/theme/tokens';

// Keep the existing on-device filename so current users keep their local library after rebranding.
const dbPromise = SQLite.openDatabaseAsync('contactory.db');

export async function initializeDatabase() {
  const db = await dbPromise;
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await db.withTransactionAsync(async () => db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY NOT NULL,
      full_name TEXT NOT NULL DEFAULT '', first_name TEXT, last_name TEXT,
      company TEXT, job_title TEXT, email TEXT, website TEXT, address TEXT,
      native_contact_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contact_phones (
      id TEXT PRIMARY KEY NOT NULL,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      phone_number TEXT NOT NULL, label TEXT, is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contact_notes (
      id TEXT PRIMARY KEY NOT NULL,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      content TEXT NOT NULL, meeting_date TEXT, location TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      kind TEXT NOT NULL DEFAULT 'custom', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contact_tags (
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL, PRIMARY KEY(contact_id, tag_id)
    );
    INSERT OR IGNORE INTO tags (id, name, kind, created_at) VALUES
      ('tag-followup', 'Follow-up', 'suggested', CURRENT_TIMESTAMP),
      ('tag-event', 'Event', 'suggested', CURRENT_TIMESTAMP),
      ('tag-industry', 'Industry', 'suggested', CURRENT_TIMESTAMP),
      ('tag-priority', 'Priority', 'suggested', CURRENT_TIMESTAMP),
      ('tag-personal', 'Personal', 'suggested', CURRENT_TIMESTAMP);
    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(full_name);
    CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
    CREATE INDEX IF NOT EXISTS idx_contact_phones_contact ON contact_phones(contact_id);
    CREATE INDEX IF NOT EXISTS idx_contact_notes_contact ON contact_notes(contact_id);
    CREATE INDEX IF NOT EXISTS idx_contact_tags_tag ON contact_tags(tag_id);
  `));
  // Earlier prototypes reserved a table for card files, but Vemori never retains those files.
  await db.execAsync('DROP TABLE IF EXISTS scanned_cards;');
  return db;
}

export async function getOnboardingComplete(): Promise<boolean> {
  const db = await dbPromise;
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_metadata WHERE key = ?', 'onboarding_complete'
  );
  return row?.value === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  const db = await dbPromise;
  await db.runAsync(
    'INSERT INTO app_metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    'onboarding_complete', 'true'
  );
}

export async function getThemePreference(): Promise<ThemeMode> {
  const db = await dbPromise;
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_metadata WHERE key = ?', 'theme_preference'
  );
  return row?.value === 'dark' ? 'dark' : 'light';
}

export async function saveThemePreference(mode: ThemeMode): Promise<void> {
  const db = await dbPromise;
  await db.runAsync(
    'INSERT INTO app_metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    'theme_preference', mode
  );
}
