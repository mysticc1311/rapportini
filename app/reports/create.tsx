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
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { addReport, NewReport } from '../../database/reports';

export default function CreateReportScreen() {
  const router = useRouter();
  const { selectedCustomer, setSelectedCustomer } = useCustomer();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const colors = Colors[theme];

  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [notes, setNotes] = useState('');
  
  const formatDateInput = (text: string): string => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const formatTimeInput = (text: string): string => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const handleSave = () => {
    if (activity.trim() == '') return Alert.alert(t('validation', language), t('activityRequired', language))
    if (!selectedCustomer) return Alert.alert(t('validation', language), t('customerRequired', language));
    if (!date.trim()) return Alert.alert(t('validation', language), t('dateRequired', language));
    if (!timeStart.trim() || !timeEnd.trim()) return Alert.alert(t('validation', language), t('timeRequired', language));

    const report: NewReport = {
      activity: activity.trim(),
      customer_id: selectedCustomer.id,
      date: date.trim(),
      time_start: timeStart.trim(),
      time_end: timeEnd.trim(),
      notes: notes.trim() || null,
    };

    addReport(report);
    setSelectedCustomer(null); // resetta per la prossima volta
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
      
      {/* Time */}
      <Text style={[styles.label, { color: colors.icon }]}>{t('time', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <View style={styles.timeRow}>
        <TextInput
          style={[styles.input, styles.timeInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder={t('timePlaceholder', language)}
          placeholderTextColor={colors.icon}
          value={timeStart}
          onChangeText={(text) => setTimeStart(formatTimeInput(text))}
          keyboardType="number-pad"
          maxLength={5}
        />
        <Ionicons name="arrow-forward" size={18} color="#475569" />
        <TextInput
          style={[styles.input, styles.timeInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder={t('timePlaceholder', language)}
          placeholderTextColor={colors.icon}
          value={timeEnd}
          onChangeText={(text) => setTimeEnd(formatTimeInput(text))}
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>

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