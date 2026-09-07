import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { Input, Button } from '../../components/UIComponents';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert(t.error, t.fillRequired);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert(t.loginFailed, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        Alert.alert(t.loginFailed, err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D6EFD', '#0A58CA', '#1a6b3a']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.languageRow}><LanguageSwitcher light /></View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>🛡️</Text>
            <Text style={styles.appName}>BioSecure Farm</Text>
            <Text style={styles.tagline}>{t.appTagline}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{t.welcomeBack}</Text>
            <Text style={styles.subtitle}>{t.signInToAccount}</Text>

            <Input
              label={t.emailAddress}
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder={t.enterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label={t.password}
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder={t.enterPassword}
              secureTextEntry={!showPass}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>{t.forgotPassword}</Text>
            </TouchableOpacity>

            <Button title={t.signIn} onPress={handleLogin} loading={loading} icon="log-in-outline" style={{ marginTop: Spacing.sm }} />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.or}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button title="Continue with Google" onPress={handleGoogleLogin} loading={loading} icon="logo-google" style={styles.googleBtn} />

            <View style={styles.roleHints}>
              {[{ role: t.farmer, emoji: '👨‍🌾' }, { role: t.veterinarian, emoji: '👨‍⚕️' }, { role: t.govOfficer, emoji: '🏛️' }, { role: t.admin, emoji: '⚙️' }].map(r => (
                <View key={r.role} style={styles.roleChip}>
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={styles.roleLabel}>{r.role}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerBtn}>
              <Text style={styles.registerText}>{t.noAccount} <Text style={styles.registerLink}>{t.register}</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  languageRow: { position: 'absolute', top: 48, right: Spacing.lg, zIndex: 2 },
  logoSection: { alignItems: 'center', marginBottom: Spacing.xl },
  logoEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  appName: { fontSize: FontSize.xxxl, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.md },
  forgotText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: Spacing.sm, color: Colors.textSecondary, fontSize: FontSize.sm },
  roleHints: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  roleChip: { alignItems: 'center', padding: Spacing.xs },
  roleEmoji: { fontSize: 24 },
  roleLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  registerBtn: { alignItems: 'center', marginTop: Spacing.sm },
  registerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  registerLink: { color: Colors.primary, fontWeight: '700' },
  googleBtn: { backgroundColor: '#DB4437', marginBottom: Spacing.md }
});
