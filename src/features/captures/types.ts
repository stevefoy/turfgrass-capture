export type CaptureStatus = 'pending' | 'uploaded';

export interface CaptureRecord {
  id: string;
  capturedAt: string;
  imageUri: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  horizontalAccuracy: number | null;
  heading: number | null;
  pitch: number | null;
  roll: number | null;
  yaw: number | null;
  motionRms: number | null;
  motionSampleCount: number;
  deviceModel: string | null;
  deviceOs: string | null;
  sharingPolicy: 'private_exact_location';
  status: CaptureStatus;
}
