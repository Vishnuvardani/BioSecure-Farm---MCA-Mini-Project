import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher({ light = false }) {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, light && styles.lightText]}>{t.language}</Text>
      <View style={[styles.control, light && styles.lightControl]}>
        {['en', 'ta'].map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => changeLanguage(option)}
            style={[styles.option, language === option && styles.activeOption]}
          >
            <Text style={[styles.optionText, language === option && styles.activeText, light && styles.lightText]}>
              {option === 'en' ? t.english : t.tamil}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 4 },
  label: { color: Colors.textSecondary, fontSize: 11 },
  lightText: { color: '#fff' },
  control: { flexDirection: 'row', borderWidth: 1, borderColor: Colors.border, borderRadius: 18, padding: 2, backgroundColor: Colors.surface },
  lightControl: { borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.12)' },
  option: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 14 },
  activeOption: { backgroundColor: Colors.primary },
  optionText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  activeText: { color: '#fff' }
});