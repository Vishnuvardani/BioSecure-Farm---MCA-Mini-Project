import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { Input, Button } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const ROLES = [
  { value: 'farmer', label: 'Farmer', icon: '👨🌾', desc: 'Manage your farms & livestock' },
  { value: 'veterinarian', label: 'Veterinarian', icon: '👨⚕️', desc: 'Diagnose & treat animals' },
  { value: 'government_officer', label: 'Gov. Officer', icon: '🏛️', desc: 'Monitor & regulate farms' },
  { value: 'admin', label: 'Admin', icon: '⚙️', desc: 'System administration' }
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', mobile: '', role: '' });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.mobile || !form.role)
      return Alert.alert('Error', 'Please fill all required fields');
    if (form.password !== form.confirmPassword)
      return Alert.alert('Error', 'Passwords do not match');
    if (form.password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await authAPI.register(form);
      navigation.navigate('OTP', { userId: res.userId, email: form.email, isRegister: true });
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
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

          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Join BioSecure Farm today</Text>

          <View style={styles.card}>
            <Input label="Full Name *" icon="person-outline" value={form.fullName} onChangeText={v => set('fullName', v)} placeholder="Enter your full name" />
            <Input label="Email Address *" icon="mail-outline" value={form.email} onChangeText={v => set('email', v)} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Mobile Number *" icon="call-outline" value={form.mobile} onChangeText={v => set('mobile', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
            <Input label="Password *" icon="lock-closed-outline" value={form.password} onChangeText={v => set('password', v)} placeholder="Min 6 characters" secureTextEntry />
            <Input label="Confirm Password *" icon="lock-closed-outline" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder="Re-enter password" secureTextEntry />

            <Text style={styles.roleLabel}>Select Role *</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, form.role === r.value && styles.roleCardActive]}
                  onPress={() => set('role', r.value)}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleName, form.role === r.value && styles.roleNameActive]}>{r.label}</Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                  {form.role === r.value && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Create Account" onPress={handleRegister} loading={loading} icon="person-add-outline" style={{ marginTop: Spacing.md }} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
              <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Sign In</Text></Text>
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
