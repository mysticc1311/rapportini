import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Customer, getAllCustomers } from '../../database/customers';

export default function SelectCustomerScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setCustomers(getAllCustomers());
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (customer: Customer) => {
    router.back();
    // Pass selected customer back to create report screen via params
    router.setParams({
      customerId: customer.id.toString(),
      customerName: customer.name,
    });
  };

  const handleNewCustomer = () => {
    router.push('/customers/create');
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.email ? <Text style={styles.itemSub}>{item.email}</Text> : null}
        {item.phone ? <Text style={styles.itemSub}>{item.phone}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No customers found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#475569"
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {/* Customer list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filtered.length === 0 ? styles.listEmpty : styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {/* New customer button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.newButton} onPress={handleNewCustomer} activeOpacity={0.85}>
          <Text style={styles.newButtonIcon}>+</Text>
          <Text style={styles.newButtonLabel}>New Customer</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 15,
    paddingVertical: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 17,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },
  itemSub: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    color: '#475569',
    fontSize: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
  },
  newButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  newButtonIcon: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  newButtonLabel: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});
