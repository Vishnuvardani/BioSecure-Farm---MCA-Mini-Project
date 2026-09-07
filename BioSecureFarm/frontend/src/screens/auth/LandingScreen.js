import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/UIComponents';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { Colors, Spacing, FontSize } from '../../theme';

export default function LandingScreen({ navigation }) {
  const { t } = useLanguage();

  return (
    <LinearGradient colors={['#0D6EFD', '#0A58CA', '#1a6b3a']} style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>BioSecure Farm</Text>
        <LanguageSwitcher light />
      </View>
      <View style={styles.content}>
        <Text style={styles.emoji}>🛡️</Text>
        <Text style={styles.title}>{t.landingTitle}</Text>
        <Text style={styles.subtitle}>{t.landingSubtitle}</Text>
        <Text style={styles.tagline}>{t.appTagline}</Text>
        <View style={styles.actions}>
          <Button title={t.getStarted} onPress={() => navigation.navigate('Register')} icon="arrow-forward-outline" />
          <Button title={t.signIn} onPress={() => navigation.navigate('Login')} icon="log-in-outline" style={styles.signInButton} textStyle={styles.signInText} />
        </View>
      </View>
      <Text style={styles.footer}>AI • GIS • LIVESTOCK HEALTH</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#fff', fontSize: FontSize.lg, fontWeight: '900' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', maxWidth: 520, width: '100%', alignSelf: 'center' },
  emoji: { fontSize: 72, marginBottom: Spacing.lg },
  title: { color: '#fff', fontSize: FontSize.xxxl, fontWeight: '900', textAlign: 'center', lineHeight: 42 },
  subtitle: { color: 'rgba(255,255,255,0.86)', fontSize: FontSize.md, lineHeight: 24, textAlign: 'center', marginTop: Spacing.md },
  tagline: { color: '#BFE8D0', fontSize: FontSize.sm, fontWeight: '700', marginTop: Spacing.xl, textAlign: 'center' },
  actions: { width: '100%', marginTop: Spacing.xl },
  signInButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', marginTop: Spacing.sm },
  signInText: { color: '#fff' },
  footer: { color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: 1, textAlign: 'center', marginBottom: Spacing.sm }
});