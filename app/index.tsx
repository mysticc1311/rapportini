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
import { deleteReport, getAllReports, ReportWithCustomer } from '../database/reports';
import { shareReportsPdf } from '../utils/pdf';

export default function ReportsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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
              <Text style={{ fontSize: 22 }}><Ionicons name="share-outline" size={22} color="#f1f5f9" /></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Text style={{ fontSize: 22 }}><Ionicons name="trash-outline" size={22} color="#ef4444" /></Text>
            </TouchableOpacity>
          </View>
        ),
        title: `${selectedIds.size} selected`,
      });
    } else {
      navigation.setOptions({
        headerLeft: undefined,
        headerRight: undefined,
        title: 'Field Reports',
      });
    }
  }, [isSelectionMode, selectedIds]);

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
    await shareReportsPdf(toShare, 'Field Reports');
    clearSelection();
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Reports',
      `Are you sure you want to delete ${selectedIds.size} report${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
    await shareReportsPdf([item], `Report – ${item.customer_name}`);
  };

  const formatTime = (start: string, end: string) => `${start} → ${end}`;

  const renderItem = ({ item }: { item: ReportWithCustomer }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => handleTap(item.id)}
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.7}
        delayLongPress={400}
      >
        {isSelectionMode && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}

        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={styles.customerName}>{item.customer_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.date}>{item.date}</Text>
              {!isSelectionMode && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => handleShareSingle(item)}>
                    <Text style={{ fontSize: 16 }}><Ionicons name="share-outline" size={22} color="#f1f5f9" /></Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.activity}>{item.activity}</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{formatTime(item.time_start, item.time_end)}</Text>
            </View>
          </View>
          {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No reports yet</Text>
      <Text style={styles.emptySubtitle}>Tap the button below to add your first field report</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" style={{ flex: 1 }} />
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
            style={styles.fab}
            onPress={() => router.push('/reports/create')}
            activeOpacity={0.85}
          >
            <Text style={styles.fabIcon}><Ionicons name="add" size={24} color="#0f172a" /></Text>
            <Text style={styles.fabLabel}>New Report</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  list: { padding: 16, paddingBottom: 100 },
  listEmpty: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardSelected: {
    borderColor: '#38bdf8',
    borderWidth: 2,
    borderLeftWidth: 2,
    backgroundColor: '#1e3a4f',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  checkmark: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerName: { color: '#38bdf8', fontWeight: '700', fontSize: 15 },
  date: { color: '#64748b', fontSize: 13 },
  activity: { color: '#f1f5f9', fontSize: 15, marginBottom: 10, lineHeight: 21 },
  timeRow: { flexDirection: 'row' },
  timeBadge: { backgroundColor: '#0f172a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  timeText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  notes: { color: '#64748b', fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '700' },
  emptySubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  fabContainer: { position: 'absolute', bottom: 28, left: 20, right: 20 },
  fab: {
    backgroundColor: '#38bdf8',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { color: '#0f172a', fontSize: 22, fontWeight: '700', lineHeight: 24 },
  fabLabel: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
});