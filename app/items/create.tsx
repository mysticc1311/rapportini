import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity
} from 'react-native';
import { Colors } from '../../constants/theme';
import { t } from '../../constants/translations';
import { useItems } from '../../context/ItemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { addItem, deleteItem, getItemById, NewItem, updateItem } from '../../database/items';

export default function CreateItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const colors = Colors[theme];
  const { addItem: addToContext } = useItems();

  const itemId = params.id ? parseInt(params.id as string) : null;
  const isEditMode = !!itemId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  /**
   * Load item data if editing
   */
  useEffect(() => {
    if (isEditMode && itemId) {
      const item = getItemById(itemId);
      if (item) {
        setName(item.name);
        setDescription(item.description || '');
        setCost(item.cost.toString());
      }
    }
  }, [itemId, isEditMode]);

  /**
   * Save item (create or update)
   */
  const handleSave = () => {
    if (name.trim() === '') return Alert.alert(t('validation', language), t('itemNameRequired', language));
    if (!cost.trim() || Number.isNaN(Number(cost)) || Number(cost) < 0) return Alert.alert(t('validation', language), t('itemCostRequired', language));

    const item: NewItem = {
      name: name.trim(),
      description: description.trim() || null,
      cost: Number(cost),
    };

    if (isEditMode && itemId) {
      // Update existing item
      updateItem(itemId, item);
      router.back();
    } else {
      // Create new item
      const result = addItem(item);
      const newItemId = result?.lastInsertRowId ?? null;

      if (newItemId) {
        addToContext({ id: newItemId, name: item.name, cost: item.cost });
      }
      router.back();
    }
  };

  /**
   * Delete item with confirmation
   */
  const handleDelete = () => {
    Alert.alert(
      t('deleteItem', language),
      t('deleteItemQuestion', language, { name: name }),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('delete', language),
          style: 'destructive',
          onPress: () => {
            if (itemId) {
              deleteItem(itemId);
              router.back();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('itemName', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('itemNamePlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={name}
        onChangeText={setName}
      />

      {/* Description */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('itemDescription', language)}</Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('itemDescriptionPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Cost */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('itemCost', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('itemCostPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={cost}
        onChangeText={setCost}
        keyboardType="decimal-pad"
      />

      {/* Save */}
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint, shadowColor: colors.tint }]} onPress={handleSave} activeOpacity={0.85}>
        <Text style={[styles.saveButtonText, { color: colors.background }]}>{isEditMode ? t('edit', language) : t('saveItem', language)}</Text>
      </TouchableOpacity>
      {isEditMode && (
        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: '#dc2626', shadowColor: '#dc2626' }]} onPress={handleDelete} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={20} color={colors.background} style={{ marginRight: 8 }} />
          <Text style={[styles.deleteButtonText, { color: colors.background }]}>{t('delete', language)}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
  },
  required: {},
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 36,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
