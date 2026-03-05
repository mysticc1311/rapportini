import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity
} from 'react-native';
import { useCustomer } from '../../context/CustomerContext';
import { addCustomer, NewCustomer } from '../../database/customers';

export default function CreateCustomerScreen() {
  const router = useRouter();
  const { setSelectedCustomer } = useCustomer();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Validation', 'Name is required.');

    const customer: NewCustomer = {
      name: name.trim(),
      address: address.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
    };

    const result = addCustomer(customer);

    setSelectedCustomer({ id: result.lastInsertRowId, name: name.trim() });
    router.dismissTo('/reports/create');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Customer or company name"
        placeholderTextColor="#475569"
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street, city..."
        placeholderTextColor="#475569"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        placeholderTextColor="#475569"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="+39 000 000 0000"
        placeholderTextColor="#475569"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveButtonText}>Save & Select Customer</Text>
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