import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { t } from '../../constants/translations';
import { useCustomer } from '../../context/CustomerContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Customer, getAllCustomers, deleteCustomer } from '../../database/customers';

export default function SelectCustomerScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const colors = Colors[theme];
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const { setSelectedCustomer } = useCustomer();

  useEffect(() => {
    setCustomers(getAllCustomers());
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer({ id: customer.id, name: customer.name });
    router.back();
  };

  const handleNewCustomer = () => {
    router.push('/customers/create');
  };

  /**
   * Handle edit customer - navigate to create screen with customer id
   */
  const handleEdit = (customer: Customer) => {
    router.push({ pathname: '/customers/create', params: { id: customer.id.toString() } });
  };

  /**
   * Handle delete customer with confirmation
   */
  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      t('deleteCustomer', language),
      t('deleteCustomerQuestion', language, { name: customer.name }),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('delete', language),
          style: 'destructive',
          onPress: () => {
            deleteCustomer(customer.id);
            setCustomers(getAllCustomers());
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.itemContent} onPress={() => handleSelect(item)} activeOpacity={0.7}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          {item.email ? <Text style={[styles.itemSub, { color: colors.icon }]}>{item.email}</Text> : null}
          {item.phone ? <Text style={[styles.itemSub, { color: colors.icon }]}>{item.phone}</Text> : null}
        </View>
        <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
      </TouchableOpacity>
      <View style={[styles.actions, { borderLeftColor: colors.border }]}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)} activeOpacity={0.6}>
          <Ionicons name="pencil" size={18} color={colors.tint} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteCustomer(item)} activeOpacity={0.6}>
          <Ionicons name="trash-outline" size={18} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: colors.icon }]}>{t('noCustomers', language)}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}><Ionicons name="search" size={18} color={colors.icon} style={{ marginRight: 8 }} /></Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('searchCustomers', language)}
          placeholderTextColor={colors.icon}
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
        <TouchableOpacity style={[styles.newButton, { backgroundColor: colors.tint, shadowColor: colors.tint }]} onPress={handleNewCustomer} activeOpacity={0.85}>
          <Text style={[styles.newButtonIcon, { color: colors.background }]}>+</Text>
          <Text style={[styles.newButtonLabel, { color: colors.background }]}>{t('newCustomer', language)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
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
  itemContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 17,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
  },
  newButton: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  newButtonIcon: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  newButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
