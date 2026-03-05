import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { useCustomer } from '../../context/CustomerContext';
import { addReport, NewReport } from '../../database/reports';

export default function CreateReportScreen() {
  const router = useRouter();
  const { selectedCustomer, setSelectedCustomer } = useCustomer();

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
    if (!selectedCustomer) return Alert.alert('Validation', 'Please select a customer.');
    if (!date.trim()) return Alert.alert('Validation', 'Date is required.');
    if (!timeStart.trim() || !timeEnd.trim()) return Alert.alert('Validation', 'Start and end time are required.');

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Activity */}
      <Text style={styles.label}>Activity <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the activity performed..."
        placeholderTextColor="#475569"
        value={activity}
        onChangeText={setActivity}
        multiline
        numberOfLines={3}
      />

      {/* Customer */}
      <Text style={styles.label}>Customer <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity
        style={[styles.input, styles.customerPicker]}
        onPress={() => router.push({ pathname: '/reports/select-customer' })}
        activeOpacity={0.7}
      >
        {selectedCustomer ? (
            <Text style={styles.customerSelected}>{selectedCustomer.name}</Text>
            ) : (
            <Text style={styles.customerPlaceholder}>Select or create a customer...</Text>
        )}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Date */}
      <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/YYYY"
        placeholderTextColor="#475569"
        value={date}
        onChangeText={(text) => setDate(formatDateInput(text))}
        keyboardType="number-pad"
        maxLength={10}
      />
      
      {/* Time */}
      <Text style={styles.label}>Time <Text style={styles.required}>*</Text></Text>
      <View style={styles.timeRow}>
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="HH:MM"
          placeholderTextColor="#475569"
          value={timeStart}
          onChangeText={(text) => setTimeStart(formatTimeInput(text))}
          keyboardType="number-pad"
          maxLength={5}
        />
        <Text style={styles.timeSeparator}>→</Text>
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="HH:MM"
          placeholderTextColor="#475569"
          value={timeEnd}
          onChangeText={(text) => setTimeEnd(formatTimeInput(text))}
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Optional notes..."
        placeholderTextColor="#475569"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveButtonText}>Save Report</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
  },
  required: {
    color: '#38bdf8',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f1f5f9',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  customerPlaceholder: {
    color: '#475569',
    fontSize: 15,
  },
  chevron: {
    color: '#475569',
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
    color: '#475569',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 36,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});