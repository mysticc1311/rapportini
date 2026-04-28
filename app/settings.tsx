import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { t } from '../constants/translations';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const colors = Colors[theme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme Section */}
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('appearance', language) || 'Appearance'}</Text>
        
        <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.tint} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {theme === 'dark' ? t('darkMode', language) || 'Dark Mode' : t('lightMode', language) || 'Light Mode'}
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={() => setMode(theme === 'dark' ? 'light' : 'dark')}
            trackColor={{ false: colors.border, true: colors.tint }}
            thumbColor={colors.background}
          />
        </View>
      </View>

      {/* Language Section */}
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('language', language) || 'Language'}</Text>
        
        <View style={[styles.languageButtons, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              styles.languageButtonFirst,
              language === 'en' && [styles.languageButtonActive, { backgroundColor: colors.tint }],
              { borderRightColor: colors.border },
            ]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.languageButtonText,
              language === 'en' ? { color: colors.background, fontWeight: '700' } : { color: colors.text, fontWeight: '500' }
            ]}>
              English
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'it' && [styles.languageButtonActive, { backgroundColor: colors.tint }],
            ]}
            onPress={() => setLanguage('it')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.languageButtonText,
              language === 'it' ? { color: colors.background, fontWeight: '700' } : { color: colors.text, fontWeight: '500' }
            ]}>
              Italiano
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.tint }]}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={20} color={colors.background} />
        <Text style={[styles.backButtonText, { color: colors.background }]}>{t('back', language) || 'Back'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  languageButtons: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    height: 48,
  },
  languageButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageButtonFirst: {
    borderRightWidth: 1,
  },
  languageButtonActive: {
  },
  languageButtonText: {
    fontSize: 15,
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
