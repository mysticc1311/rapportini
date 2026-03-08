import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { t } from '../constants/translations';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { deleteReport, getAllReports, ReportWithCustomer } from '../database/reports';
import { shareReportsPdf } from '../utils/pdf';

export default function ReportsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const colors = Colors[theme];
  const [reports, setReports] = useState<ReportWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const isSelectionMode = selectedIds.size > 0;

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setReports(getAllReports());
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    if (isSelectionMode) {
      navigation.setOptions({
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 16, marginRight: 16 }}>
            <TouchableOpacity onPress={handleShareSelected}>
              <Text style={{ fontSize: 22 }}><Ionicons name="share-outline" size={30} color={colors.text} /></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Text style={{ fontSize: 22 }}><Ionicons name="trash-outline" size={30} color="#dc2626" /></Text>
            </TouchableOpacity>
          </View>
        ),
        title: `${selectedIds.size} selected`,
      });
    } else {
      navigation.setOptions({
        headerLeft: undefined,
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 12, marginRight: 16 }}>
            <TouchableOpacity
              onPress={() => setLanguage(language === 'en' ? 'it' : 'en')}
              style={{ padding: 8 }}
              activeOpacity={0.6}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                {language === 'en' ? 'IT' : 'EN'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode(theme === 'dark' ? 'light' : 'dark')}
              style={{ padding: 8 }}
              activeOpacity={0.6}
            >
              <Ionicons
                name={theme === 'dark' ? 'sunny' : 'moon'}
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        ),
        title: t('fieldReports', language),
      });
    }
  }, [isSelectionMode, selectedIds, theme, language, colors.text, setMode, setLanguage]);

  const clearSelection = () => setSelectedIds(new Set());

  const handleLongPress = (id: number) => {
    const next = new Set(selectedIds);
    next.add(id);
    setSelectedIds(next);
  };

  const handleTap = (id: number) => {
    if (!isSelectionMode) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleShareSelected = async () => {
    const toShare = reports.filter((r) => selectedIds.has(r.id));
    await shareReportsPdf(toShare, t('fieldReports', language));
    clearSelection();
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    const plural = count > 1 ? 's' : '';
    Alert.alert(
      t('deleteReports', language),
      t('deleteQuestion', language, { count: count.toString(), plural }),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('delete', language),
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => deleteReport(id));
            setReports((prev) => prev.filter((r) => !selectedIds.has(r.id)));
            clearSelection();
          },
        },
      ]
    );
  };

  const handleShareSingle = async (item: ReportWithCustomer) => {
    await shareReportsPdf([item], `Report - ${item.customer_name}`);
  };

  const formatTime = (start: string, end: string) => `${start} ${<Ionicons name="arrow-forward" size={18} color="#475569" />} ${end}`;

  const renderItem = ({ item }: { item: ReportWithCustomer }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected, { borderLeftColor: colors.tint, backgroundColor: colors.card }]}
        onPress={() => handleTap(item.id)}
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.7}
        delayLongPress={400}
      >
        {isSelectionMode && (
          <View style={[styles.checkbox, isSelected && [styles.checkboxSelected, { backgroundColor: colors.tint, borderColor: colors.tint }], { borderColor: colors.border }]}>
            {isSelected && <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text>}
          </View>
        )}

        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={[styles.customerName, { color: colors.tint }]}>{item.customer_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={[styles.date, { color: colors.icon }]}>{item.date}</Text>
              {!isSelectionMode && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => handleShareSingle(item)}>
                    <Text style={{ fontSize: 24 }}><Ionicons name="share-outline" size={22} color={colors.text} /></Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <Text style={[styles.activity, { color: colors.text }]}>{item.activity}</Text>
          <View style={styles.timeRow}>
            <View style={[styles.timeBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.timeText, { color: colors.icon }]}>{formatTime(item.time_start, item.time_end)}</Text>
            </View>
          </View>
          {item.notes ? <Text style={[styles.notes, { color: colors.icon }]}>{item.notes}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noReports', language)}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>{t('noReportsDescription', language)}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={reports.length === 0 ? styles.listEmpty : styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!isSelectionMode && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.tint, shadowColor: colors.tint }]}
            onPress={() => router.push('/reports/create')}
            activeOpacity={0.85}
          >
            <Text style={styles.fabIcon}><Ionicons name="add" size={24} color={colors.background} /></Text>
            <Text style={[styles.fabLabel, { color: colors.background }]}>{t('newReport', language)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  listEmpty: { flex: 1, padding: 16 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardSelected: {
    borderWidth: 2,
    borderLeftWidth: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {},
  checkmark: { fontSize: 13, fontWeight: '700' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerName: { fontWeight: '700', fontSize: 15 },
  date: { fontSize: 13 },
  activity: { fontSize: 15, marginBottom: 10, lineHeight: 21 },
  timeRow: { flexDirection: 'row' },
  timeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  timeText: { fontSize: 13, fontWeight: '600' },
  notes: { fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  fabContainer: { position: 'absolute', bottom: 28, left: 20, right: 20 },
  fab: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 22, fontWeight: '700', lineHeight: 24 },
  fabLabel: { fontSize: 16, fontWeight: '700' },
});