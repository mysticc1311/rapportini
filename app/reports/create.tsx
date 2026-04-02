import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { t } from '../../constants/translations';
import { useCustomer } from '../../context/CustomerContext';
import { useItems } from '../../context/ItemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { addReport, NewReport } from '../../database/reports';
import { addItemToReport } from '../../database/reportItems';

/**
 * Screen for creating a new field report
 * 
 * Collects:
 * - Activity description
 * - Customer (selected from separate screen)
 * - Date of work
 * - Hours worked and hourly cost
 * - Items used (selected from separate screen with quantities)
 * - Optional notes
 * 
 * Saves to database:
 * 1. Insert report record
 * 2. Link selected items to report via report_items bridge table
 */
export default function CreateReportScreen() {
  const router = useRouter();
  const { selectedCustomer, setSelectedCustomer } = useCustomer();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const colors = Colors[theme];
  // Get selected items from context (populated when user returns from select-items screen)
  const { selectedItems, clearItems } = useItems();

  // Form state
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [hourCost, setHourCost] = useState('');
  const [notes, setNotes] = useState('');
  
  /**
   * Format date input as DD/MM/YYYY while user types
   */
  const formatDateInput = (text: string): string => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  /**
   * Save report with validation
   * 1. Validate all required fields
   * 2. Create report in database
   * 3. Link each selected item to report with its quantity
   * 4. Clear state and navigate back
   */
  const handleSave = () => {
    // Validation checks
    if (activity.trim() == '') return Alert.alert(t('validation', language), t('activityRequired', language));
    if (!selectedCustomer) return Alert.alert(t('validation', language), t('customerRequired', language));
    if (!date.trim()) return Alert.alert(t('validation', language), t('dateRequired', language));
    if (!hoursWorked.trim() || Number.isNaN(Number(hoursWorked)) || Number(hoursWorked) <= 0) return Alert.alert(t('validation', language), t('hoursRequired', language));
    if (!hourCost.trim() || Number.isNaN(Number(hourCost)) || Number(hourCost) < 0) return Alert.alert(t('validation', language), t('costRequired', language));

    // Build report object
    const report: NewReport = {
      activity: activity.trim(),
      customer_id: selectedCustomer.id,
      date: date.trim(),
      hours_worked: Number(hoursWorked),
      hour_cost: Number(hourCost),
      notes: notes.trim() || null,
    };

    // Insert report and get the new report ID
    const result = addReport(report);
    const newReportId = result?.lastInsertRowId ?? null;

    // Link items to report via bridge table with quantities
    if (newReportId && selectedItems.length > 0) {
      selectedItems.forEach((item) => {
        addItemToReport(newReportId, item.id, item.quantity);
      });
    }

    // Clean up state and return
    setSelectedCustomer(null);
    clearItems();
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Activity */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('activity', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('activityPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={activity}
        onChangeText={setActivity}
        multiline
        numberOfLines={3}
      />

      {/* Customer */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('customer', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TouchableOpacity
        style={[styles.input, styles.customerPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push({ pathname: '/reports/select-customer' })}
        activeOpacity={0.7}
      >
        {selectedCustomer ? (
            <Text style={[styles.customerSelected, { color: colors.tint }]}>{selectedCustomer.name}</Text>
            ) : (
            <Text style={[styles.customerPlaceholder, { color: colors.icon }]}>{t('customerPlaceholder', language)}</Text>
        )}
        <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
      </TouchableOpacity>

      {/* Date */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('date', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('datePlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={date}
        onChangeText={(text) => setDate(formatDateInput(text))}
        keyboardType="number-pad"
        maxLength={10}
      />
      
      {/* Hours Worked */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('hoursWorked', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('hoursWorkedPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={hoursWorked}
        onChangeText={setHoursWorked}
        keyboardType="decimal-pad"
      />

      {/* Hour Cost */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('hourCost', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('hourCostPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={hourCost}
        onChangeText={setHourCost}
        keyboardType="decimal-pad"
      />

      {/* Items */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('itemsUsed', language)}</Text>
      <TouchableOpacity
        style={[styles.input, styles.itemsPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push({ pathname: '/reports/select-items' })}
        activeOpacity={0.7}
      >
        {selectedItems.length > 0 ? (
          <View style={styles.selectedItemsContainer}>
            {selectedItems.map((item) => (
              <View key={item.id} style={[styles.selectedItemBadge, { backgroundColor: colors.tint }]}>
                <Text style={[styles.selectedItemBadgeText, { color: colors.background }]}>{item.name} × {item.quantity}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.itemsPlaceholder, { color: colors.icon }]}>{t('selectItems', language)}</Text>
        )}
        <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
      </TouchableOpacity>

      {/* Notes */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('notes', language)}</Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('notesPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {/* Save */}
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint, shadowColor: colors.tint }]} onPress={handleSave} activeOpacity={0.85}>
        <Text style={[styles.saveButtonText, { color: colors.background }]}>{t('saveReport', language)}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
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
  customerPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerSelected: {
    fontSize: 15,
    fontWeight: '600',
  },
  customerPlaceholder: {
    fontSize: 15,
  },
  itemsPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  selectedItemsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  selectedItemBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginVertical: 2,
  },
  selectedItemBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsPlaceholder: {
    fontSize: 15,
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    flex: 1,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 18,
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
});