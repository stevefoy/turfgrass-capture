import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { DeviceMotion } from 'expo-sensors';
import { useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { insertCapture } from '@/features/captures/repository';
import {
  isCaptureStable,
  summarizeMotion,
  type MotionSample,
} from '@/features/captures/motion';
import type { CaptureRecord } from '@/features/captures/types';
import { colors } from '@/theme';

const MAX_MOTION_SAMPLES = 12;

async function copyPhotoToAppStorage(sourceUri: string, captureId: string) {
  if (!FileSystem.documentDirectory) {
    throw new Error('App document storage is unavailable.');
  }

  const captureDirectory = `${FileSystem.documentDirectory}captures`;
  const destinationUri = `${captureDirectory}/${captureId}.jpg`;

  await FileSystem.makeDirectoryAsync(captureDirectory, {
    intermediates: true,
  });
  await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });

  return destinationUri;
}

async function getBestAvailablePosition() {
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch {
    return Location.getLastKnownPositionAsync({
      maxAge: 60_000,
      requiredAccuracy: 100,
    });
  }
}

export default function CaptureScreen() {
  const database = useSQLiteContext();
  const cameraRef = useRef<CameraView>(null);
  const motionSamples = useRef<MotionSample[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [motionAvailable, setMotionAvailable] = useState(false);
  const [motionGranted, setMotionGranted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [latestMotion, setLatestMotion] = useState<MotionSample | null>(null);

  const motionSummary = useMemo(
    () => summarizeMotion(latestMotion ? [latestMotion] : []),
    [latestMotion],
  );
  const stable = isCaptureStable(motionSummary);

  useEffect(() => {
    void DeviceMotion.isAvailableAsync().then(setMotionAvailable);
  }, []);

  useEffect(() => {
    if (!motionAvailable || !motionGranted) {
      return;
    }

    DeviceMotion.setUpdateInterval(150);
    const subscription = DeviceMotion.addListener((sample) => {
      motionSamples.current = [
        ...motionSamples.current.slice(-(MAX_MOTION_SAMPLES - 1)),
        sample,
      ];
      setLatestMotion(sample);
    });

    return () => subscription.remove();
  }, [motionAvailable, motionGranted]);

  async function requestCapturePermissions() {
    const cameraResult = await requestCameraPermission();
    await requestLocationPermission();

    if (motionAvailable) {
      const motionResult = await DeviceMotion.requestPermissionsAsync();
      setMotionGranted(motionResult.granted);
    }

    if (!cameraResult.granted) {
      Alert.alert(
        'Camera permission required',
        'Camera access is needed to photograph turfgrass plots.',
      );
    }
  }

  async function capturePlot(_event?: GestureResponderEvent) {
    if (!cameraRef.current || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      let activeLocationPermission = locationPermission;

      if (!activeLocationPermission?.granted) {
        activeLocationPermission = await requestLocationPermission();
      }

      const [photo, position] = await Promise.all([
        cameraRef.current.takePictureAsync({ quality: 0.9 }),
        activeLocationPermission.granted
          ? getBestAvailablePosition()
          : Promise.resolve(null),
      ]);

      if (!photo) {
        throw new Error('The camera did not return a photograph.');
      }

      const id = Crypto.randomUUID();
      const imageUri = await copyPhotoToAppStorage(photo.uri, id);
      const summary = summarizeMotion(motionSamples.current);
      const record: CaptureRecord = {
        id,
        capturedAt: new Date().toISOString(),
        imageUri,
        latitude: position?.coords.latitude ?? null,
        longitude: position?.coords.longitude ?? null,
        altitude: position?.coords.altitude ?? null,
        horizontalAccuracy: position?.coords.accuracy ?? null,
        heading: position?.coords.heading ?? null,
        pitch: summary.pitch,
        roll: summary.roll,
        yaw: summary.yaw,
        motionRms: summary.motionRms,
        motionSampleCount: summary.sampleCount,
        deviceModel: Device.modelName,
        deviceOs:
          [Device.osName, Device.osVersion].filter(Boolean).join(' ') || null,
        sharingPolicy: 'private_exact_location',
        status: 'pending',
      };

      await insertCapture(database, record);
      router.replace('/');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The capture could not be saved.';
      Alert.alert('Capture not saved', message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!cameraPermission?.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Ionicons color={colors.primary} name="camera-outline" size={44} />
        <Text style={styles.permissionTitle}>Prepare field capture</Text>
        <Text style={styles.permissionBody}>
          Turfgrass Capture records a plot photograph, foreground GPS position
          and a short motion summary. Exact coordinates remain private on this
          device.
        </Text>
        <View style={styles.permissionButton}>
          <PrimaryButton
            icon="lock-open-outline"
            label="Allow capture permissions"
            onPress={() => void requestCapturePermissions()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} />

      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.overlayTop}>
          <View style={styles.statusPill}>
            <Ionicons
              color="#ffffff"
              name={
                locationPermission?.granted ? 'location' : 'location-outline'
              }
              size={15}
            />
            <Text style={styles.statusPillText}>
              {locationPermission?.granted
                ? 'GPS enabled'
                : 'GPS permission needed'}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Ionicons
              color="#ffffff"
              name={stable ? 'checkmark-circle-outline' : 'warning-outline'}
              size={15}
            />
            <Text style={styles.statusPillText}>
              {stable ? 'Hold steady' : 'Camera moving'}
            </Text>
          </View>
        </View>

        <View style={styles.plotFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.guidePanel}>
          <Text style={styles.guideTitle}>Frame one turfgrass plot</Text>
          <Text style={styles.guideBody}>
            Keep the phone level, avoid shadows and fill the guide with turf.
          </Text>
        </View>
      </View>

      <View style={styles.shutterBar}>
        <Pressable
          accessibilityLabel="Capture turfgrass plot"
          accessibilityRole="button"
          disabled={isSaving}
          onPress={capturePlot}
          style={({ pressed }) => [
            styles.shutter,
            pressed && styles.shutterPressed,
            isSaving && styles.shutterDisabled,
          ]}
        >
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionScreen: {
    alignItems: 'center',
    backgroundColor: colors.canvas,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 12,
  },
  permissionBody: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 390,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 22,
    minWidth: 260,
  },
  cameraScreen: {
    backgroundColor: '#000000',
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 132,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  overlayTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: colors.cameraOverlay,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  statusPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  plotFrame: {
    alignSelf: 'center',
    aspectRatio: 1,
    maxWidth: 460,
    position: 'relative',
    width: '88%',
  },
  corner: {
    borderColor: colors.cameraLine,
    height: 34,
    position: 'absolute',
    width: 34,
  },
  topLeft: {
    borderLeftWidth: 3,
    borderTopWidth: 3,
    left: 0,
    top: 0,
  },
  topRight: {
    borderRightWidth: 3,
    borderTopWidth: 3,
    right: 0,
    top: 0,
  },
  bottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    bottom: 0,
    right: 0,
  },
  guidePanel: {
    alignSelf: 'center',
    backgroundColor: colors.cameraOverlay,
    borderRadius: 4,
    maxWidth: 370,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  guideTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  guideBody: {
    color: colors.cameraMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    textAlign: 'center',
  },
  shutterBar: {
    alignItems: 'center',
    backgroundColor: colors.cameraOverlay,
    bottom: 0,
    height: 112,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  shutter: {
    alignItems: 'center',
    borderColor: '#ffffff',
    borderRadius: 38,
    borderWidth: 3,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  shutterPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    backgroundColor: '#ffffff',
    borderRadius: 31,
    height: 62,
    width: 62,
  },
});
