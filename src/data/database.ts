import type { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS captures (
      id TEXT PRIMARY KEY NOT NULL,
      captured_at TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      altitude REAL,
      horizontal_accuracy REAL,
      heading REAL,
      pitch REAL,
      roll REAL,
      yaw REAL,
      motion_rms REAL,
      motion_sample_count INTEGER NOT NULL DEFAULT 0,
      device_model TEXT,
      device_os TEXT,
      sharing_policy TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS captures_status_idx
      ON captures (status, captured_at DESC);
  `);
}
