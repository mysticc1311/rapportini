import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllReports, ReportWithCustomer } from '../database/reports';
import { shareReportsPdf } from '../utils/pdf';


export default function ReportsListScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => shareReportsPdf(reports, 'All Field Reports')}
          style={{ marginRight: 16 }}
          disabled={reports.length === 0}
        >
          <Text style={{ fontSize: 22 }}>📤</Text>
        </TouchableOpacity>
      ),
    });
  }, [reports]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const data = getAllReports();
      setReports(data);
      setLoading(false);
    }, [])
  );

  const formatTime = (start: string, end: string) => `${start} → ${end}`;

  const renderItem = ({ item }: { item: ReportWithCustomer }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
      <Text style={styles.customerName}>{item.customer_name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.date}>{item.date}</Text>
          <TouchableOpacity onPress={() => shareReportsPdf([item], `Report – ${item.customer_name}`)}>
            <Text style={{ fontSize: 16 }}>📤</Text>
          </TouchableOpacity>
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
  );

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

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/reports/create')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabLabel}>New Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerName: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 15,
  },
  date: {
    color: '#64748b',
    fontSize: 13,
  },
  activity: {
    color: '#f1f5f9',
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 21,
  },
  timeRow: {
    flexDirection: 'row',
  },
  timeBadge: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  notes: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
  },
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
  fabIcon: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  fabLabel: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});
