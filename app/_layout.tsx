import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Colors } from '../constants/theme';
import { t } from '../constants/translations';
import { CustomerProvider } from '../context/CustomerContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { initDatabase } from '../database/db';

function RootLayoutContent() {
  useEffect(() => {
    initDatabase();
  }, []);

  const { theme } = useTheme();
  const { language } = useLanguage();
  const colors = Colors[theme];

  return (
    <>
      <CustomerProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.text },
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ title: t('fieldReports', language) }} />
          <Stack.Screen name="reports/create" options={{ title: t('newReport', language) }} />
          <Stack.Screen name="reports/select-customer" options={{ title: t('selectCustomer', language), presentation: 'modal' }} />
          <Stack.Screen name="customers/create" options={{ title: t('newCustomer', language), presentation: 'modal' }} />
        </Stack>
      </CustomerProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
