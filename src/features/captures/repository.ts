import type { SQLiteDatabase } from 'expo-sqlite';

import type { CaptureRecord } from './types';

export async function insertCapture(
  database: SQLiteDatabase,
  capture: CaptureRecord,
) {
  await database.runAsync(
    `
      INSERT INTO captures (
        id, captured_at, image_uri, latitude, longitude, altitude,
        horizontal_accuracy, heading, pitch, roll, yaw, motion_rms,
        motion_sample_count, device_model, device_os, sharing_policy, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    capture.id,
    capture.capturedAt,
    capture.imageUri,
    capture.latitude,
    capture.longitude,
    capture.altitude,
    capture.horizontalAccuracy,
    capture.heading,
    capture.pitch,
    capture.roll,
    capture.yaw,
    capture.motionRms,
    capture.motionSampleCount,
    capture.deviceModel,
    capture.deviceOs,
    capture.sharingPolicy,
    capture.status,
  );
}

export async function listRecentCaptures(database: SQLiteDatabase) {
  return database.getAllAsync<CaptureRecord>(`
    SELECT
      id,
      captured_at AS capturedAt,
      image_uri AS imageUri,
      latitude,
      longitude,
      altitude,
      horizontal_accuracy AS horizontalAccuracy,
      heading,
      pitch,
      roll,
      yaw,
      motion_rms AS motionRms,
      motion_sample_count AS motionSampleCount,
      device_model AS deviceModel,
      device_os AS deviceOs,
      sharing_policy AS sharingPolicy,
      status
    FROM captures
    ORDER BY captured_at DESC
    LIMIT 30
  `);
}

export async function countPendingCaptures(database: SQLiteDatabase) {
  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM captures WHERE status = 'pending'`,
  );

  return row?.count ?? 0;
}
