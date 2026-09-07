import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { Input, Button } from '../../components/UIComponents';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const ROLES = [
  { value: 'farmer', labelKey: 'farmer', descKey: 'manageFarms', icon: '👨🌾' },
  { value: 'veterinarian', labelKey: 'veterinarian', descKey: 'diagnoseAnimals', icon: '👨⚕️' },
  { value: 'government_officer', labelKey: 'govOfficer', descKey: 'monitorFarms', icon: '🏛️' },
  { value: 'admin', labelKey: 'admin', descKey: 'systemAdministration', icon: '⚙️' }
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', mobile: '', role: '' });
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.mobile || !form.role)
      return Alert.alert(t.error, t.fillRequired);
    if (form.password !== form.confirmPassword)
      return Alert.alert(t.error, t.passwordsMismatch);
    if (form.password.length < 6)
      return Alert.alert(t.error, t.passwordLength);

    setLoading(true);
    try {
      const res = await authAPI.register(form);
      navigation.navigate('OTP', { userId: res.userId, email: form.email, isRegister: true });
    } catch (err) {
      Alert.alert(t.registrationFailed, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D6EFD', '#0A58CA', '#1a6b3a']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.languageRow}><LanguageSwitcher light /></View>

          <Text style={styles.heading}>{t.createAccount}</Text>
          <Text style={styles.subheading}>{t.joinToday}</Text>

          <View style={styles.card}>
            <Input label={t.fullName} icon="person-outline" value={form.fullName} onChangeText={v => set('fullName', v)} placeholder={t.enterFullName} />
            <Input label={`${t.emailAddress} *`} icon="mail-outline" value={form.email} onChangeText={v => set('email', v)} placeholder={t.enterEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label={t.mobileNumber} icon="call-outline" value={form.mobile} onChangeText={v => set('mobile', v)} placeholder={t.mobilePlaceholder} keyboardType="phone-pad" />
            <Input label={`${t.password} *`} icon="lock-closed-outline" value={form.password} onChangeText={v => set('password', v)} placeholder={t.minPassword} secureTextEntry />
            <Input label={t.confirmPassword} icon="lock-closed-outline" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder={t.reenterPassword} secureTextEntry />

            <Text style={styles.roleLabel}>{t.selectRole}</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, form.role === r.value && styles.roleCardActive]}
                  onPress={() => set('role', r.value)}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleName, form.role === r.value && styles.roleNameActive]}>{t[r.labelKey]}</Text>
                  <Text style={styles.roleDesc}>{t[r.descKey]}</Text>
                  {form.role === r.value && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button title={t.createAccount} onPress={handleRegister} loading={loading} icon="person-add-outline" style={{ marginTop: Spacing.md }} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
              <Text style={styles.loginText}>{t.haveAccount} <Text style={styles.loginLink}>{t.signIn}</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: Spacing.lg, paddingTop: 60 },
  backBtn: { marginBottom: Spacing.md },
  languageRow: { position: 'absolute', top: 60, right: Spacing.lg },
  heading: { fontSize: FontSize.xxxl, fontWeight: '900', color: '#fff' },
  subheading: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.lg },
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.lg },
  roleLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  roleCard: { width: '47%', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.background, position: 'relative' },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  roleNameActive: { color: Colors.primary },
  roleDesc: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  checkmark: { position: 'absolute', top: 8, right: 8 },
  loginBtn: { alignItems: 'center', marginTop: Spacing.md },
  loginText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontWeight: '700' }
});
