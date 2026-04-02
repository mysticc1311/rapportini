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
import { useItems } from '../../context/ItemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllItems, Item, deleteItem } from '../../database/items';

/**
 * Screen for selecting items to include in a report
 * 
 * Flow:
 * 1. Load all available items from database
 * 2. User searches/filters items
 * 3. User toggles items on/off with checkboxes
 * 4. For selected items, user can set quantity using +/- buttons or text input
 * 5. User presses "Done" to return with selections saved in context
 */
export default function SelectItemsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const colors = Colors[theme];
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  // Get selectedItems and methods from context (selections persist until report saved)
  const { selectedItems, addItem, removeItem, updateQuantity } = useItems();

  // Load all items on mount
  useEffect(() => {
    setItems(getAllItems());
  }, []);

  // Filter items based on search query
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase())
  );

  // Check if item is already selected
  const isSelected = (itemId: number) => selectedItems.some((i) => i.id === itemId);

  // Get quantity for selected item (undefined if not selected)
  const getSelectedItemQuantity = (itemId: number) => {
    return selectedItems.find((i) => i.id === itemId)?.quantity ?? 1;
  };

  // Toggle item selection on/off
  const handleToggle = (item: Item) => {
    if (isSelected(item.id)) {
      removeItem(item.id);
    } else {
      addItem({ id: item.id, name: item.name, cost: item.cost });
    }
  };

  // Update quantity when user types in the input field
  const handleQuantityChange = (itemId: number, value: string) => {
    const num = parseFloat(value);
    if (!Number.isNaN(num) && num > 0) {
      updateQuantity(itemId, num);
    }
  };

  // Return to report creation screen
  const handleDone = () => {
    router.back();
  };

  // Create new item while in selection screen
  const handleNewItem = () => {
    router.push('/items/create');
  };

  /**
   * Handle edit item - navigate to create screen with item id
   */
  const handleEdit = (item: Item) => {
    router.push({ pathname: '/items/create', params: { id: item.id.toString() } });
  };

  /**
   * Handle delete item with confirmation
   */
  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      t('deleteItem', language),
      t('deleteItemQuestion', language, { name: item.name }),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('delete', language),
          style: 'destructive',
          onPress: () => {
            deleteItem(item.id);
            setItems(getAllItems());
          },
        },
      ]
    );
  };

  // Render each item with checkbox and quantity controls if selected
  const renderItem = ({ item }: { item: Item }) => {
    const selected = isSelected(item.id);
    const quantity = getSelectedItemQuantity(item.id);
    
    return (
      <View>
        <View style={[styles.itemContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.itemContent,
              selected && [styles.itemSelected, { borderColor: colors.tint }],
            ]}
            onPress={() => handleToggle(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, selected && [styles.checkboxSelected, { backgroundColor: colors.tint, borderColor: colors.tint }], { borderColor: colors.border }]}>
              {selected && <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text>}
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              {item.description ? <Text style={[styles.itemSub, { color: colors.icon }]}>{item.description}</Text> : null}
            </View>
            <Text style={[styles.itemCost, { color: colors.tint }]}>€{item.cost.toFixed(2)}</Text>
          </TouchableOpacity>
          <View style={[styles.actions, { borderLeftColor: colors.border }]}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)} activeOpacity={0.6}>
              <Ionicons name="pencil" size={18} color={colors.tint} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteItem(item)} activeOpacity={0.6}>
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantity controls - only show if item is selected */}
        {selected && (
          <View style={[styles.quantityContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.quantityLabel, { color: colors.icon }]}>{t('quantity', language)}:</Text>
            <View style={styles.quantityControls}>
              {/* Decrease quantity button */}
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => updateQuantity(item.id, quantity - 0.5)}
              >
                <Text style={[styles.quantityButtonText, { color: colors.text }]}>−</Text>
              </TouchableOpacity>
              {/* Quantity input field */}
              <TextInput
                style={[styles.quantityInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={quantity.toString()}
                onChangeText={(value) => handleQuantityChange(item.id, value)}
                keyboardType="decimal-pad"
              />
              {/* Increase quantity button */}
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => updateQuantity(item.id, quantity + 0.5)}
              >
                <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Empty state when no items found
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: colors.icon }]}>{t('noItems', language)}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}><Ionicons name="search" size={18} color={colors.icon} style={{ marginRight: 8 }} /></Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('searchItems', language)}
          placeholderTextColor={colors.icon}
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {/* Selected items count indicator */}
      {selectedItems.length > 0 && (
        <View style={[styles.selectedCount, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.selectedCountText, { color: colors.text }]}>
            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
          </Text>
        </View>
      )}

      {/* Items list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filtered.length === 0 ? styles.listEmpty : styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom buttons: New Item and Done */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={[styles.newButton, { backgroundColor: colors.tint, shadowColor: colors.tint }]} onPress={handleNewItem} activeOpacity={0.85}>
          <Text style={[styles.newButtonIcon, { color: colors.background }]}>+</Text>
          <Text style={[styles.newButtonLabel, { color: colors.background }]}>{t('newItem', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.tint, shadowColor: colors.tint }]} onPress={handleDone} activeOpacity={0.85}>
          <Text style={[styles.doneButtonText, { color: colors.background }]}>{t('done', language)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  selectedCount: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 160,
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
  itemSelected: {
    backgroundColor: '#f0f4ff',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {},
  checkmark: {
    fontWeight: '700',
    fontSize: 14,
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
  itemCost: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    gap: 10,
  },
  newButton: {
    borderRadius: 14,
    paddingVertical: 14,
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
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  newButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  doneButton: {
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantityContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  quantityInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
