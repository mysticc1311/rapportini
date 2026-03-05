import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initDatabase } from '../database/db';

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          contentStyle: { backgroundColor: '#0f172a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Rapportini' }} />
        <Stack.Screen name="reports/create" options={{ title: 'New Report' }} />
        <Stack.Screen name="reports/select-customer" options={{ title: 'Select Customer', presentation: 'modal' }} />
        <Stack.Screen name="customers/create" options={{ title: 'New Customer', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
