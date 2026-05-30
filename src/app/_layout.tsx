import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { initializeDatabase } from '@/data/database';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="turfgrass-capture.db"
      onInit={initializeDatabase}
    >
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="capture" options={{ title: 'New plot capture' }} />
      </Stack>
    </SQLiteProvider>
  );
}
