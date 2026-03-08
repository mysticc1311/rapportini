import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { t } from '../../constants/translations';
import { useCustomer } from '../../context/CustomerContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { addCustomer, NewCustomer } from '../../database/customers';

export default function CreateCustomerScreen() {
  const router = useRouter();
  const { setSelectedCustomer } = useCustomer();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const colors = Colors[theme];
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name.trim()) return Alert.alert(t('validation', language), t('nameRequired', language));

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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <Text style={[styles.label, { color: colors.icon }]}>{t('name', language)} <Text style={[styles.required, { color: colors.tint }]}>*</Text></Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('namePlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={[styles.label, { color: colors.icon }]}>{t('address', language)}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('addressPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={address}
        onChangeText={setAddress}
      />

      <Text style={[styles.label, { color: colors.icon }]}>{t('email', language)}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={t('emailPlaceholder', language)}
        placeholderTextColor={colors.icon}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: colors.icon }]}>{t('phone', language)}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="+39 000 000 0000"
        placeholderTextColor={colors.icon}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint, shadowColor: colors.tint }]} onPress={handleSave} activeOpacity={0.85}>
        <Text style={[styles.saveButtonText, { color: colors.background }]}>{t('saveCustomer', language)}</Text>
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