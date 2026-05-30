import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import {
  countPendingCaptures,
  listRecentCaptures,
} from '@/features/captures/repository';
import type { CaptureRecord } from '@/features/captures/types';
import { colors } from '@/theme';

function formatCaptureTime(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export default function HomeScreen() {
  const database = useSQLiteContext();
  const [captures, setCaptures] = useState<CaptureRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const loadCaptures = useCallback(async () => {
    const [records, count] = await Promise.all([
      listRecentCaptures(database),
      countPendingCaptures(database),
    ]);

    setCaptures(records);
    setPendingCount(count);
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void loadCaptures();
    }, [loadCaptures]),
  );

  const renderCapture: ListRenderItem<CaptureRecord> = ({ item }) => (
    <View style={styles.captureRow}>
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      <View style={styles.captureDetails}>
        <Text style={styles.captureDate}>
          {formatCaptureTime(item.capturedAt)}
        </Text>
        <View style={styles.metadataLine}>
          <Ionicons
            color={colors.mutedText}
            name="location-outline"
            size={15}
          />
          <Text style={styles.metadataText}>
            {item.horizontalAccuracy === null
              ? 'GPS unavailable'
              : `GPS accuracy ${Math.round(item.horizontalAccuracy)} m`}
          </Text>
        </View>
      </View>
      <View style={styles.pendingBadge}>
        <Text style={styles.pendingBadgeText}>Pending</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={captures}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons color={colors.primary} name="images-outline" size={30} />
            <Text style={styles.emptyTitle}>No plot captures yet</Text>
            <Text style={styles.emptyBody}>
              Start with a clear, top-down photograph of a turfgrass plot.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>FIELD COLLECTION</Text>
            <Text style={styles.title}>Turfgrass Capture</Text>
            <Text style={styles.subtitle}>
              Collect consistent plot imagery with location and motion metadata.
            </Text>

            <View style={styles.queuePanel}>
              <View>
                <Text style={styles.queueLabel}>PRIVATE DEVICE QUEUE</Text>
                <Text style={styles.queueValue}>
                  {pendingCount} pending captures
                </Text>
              </View>
              <Ionicons
                color={colors.primary}
                name="cloud-offline-outline"
                size={28}
              />
            </View>

            <PrimaryButton
              icon="camera-outline"
              label="Capture new plot"
              onPress={() => router.push('/capture')}
            />

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Recent captures</Text>
              <Text style={styles.sectionCount}>{captures.length}</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <Text style={styles.privacyNote}>
            Exact GPS remains private on this device until a protected sync
            service is configured.
          </Text>
        }
        renderItem={renderCapture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  queuePanel: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: '#c9dfcf',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 22,
    padding: 16,
  },
  queueLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  queueValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 30,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCount: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '700',
  },
  captureRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  thumbnail: {
    backgroundColor: colors.primarySoft,
    borderRadius: 4,
    height: 54,
    width: 54,
  },
  captureDetails: {
    flex: 1,
  },
  captureDate: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  metadataLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    marginTop: 5,
  },
  metadataText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  pendingBadge: {
    backgroundColor: '#fff0df',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  pendingBadgeText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 6,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginTop: 2,
    padding: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  emptyBody: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  privacyNote: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 22,
  },
});
