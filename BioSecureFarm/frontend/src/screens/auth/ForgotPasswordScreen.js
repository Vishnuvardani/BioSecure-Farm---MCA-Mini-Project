import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { Input, Button } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return Alert.alert('Error', 'Enter your email address');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      navigation.navigate('OTP', { userId: res.userId, email, isRegister: false });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D6EFD', '#0A58CA', '#1a6b3a']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email to receive a reset OTP</Text>
        <View style={styles.card}>
          <Input label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" />
          <Button title="Send OTP" onPress={handleSubmit} loading={loading} icon="send-outline" />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, paddingTop: 60, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: Spacing.lg },
  icon: { fontSize: 64, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.xl, textAlign: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: BorderRadius.xl, padding: Spacing.xl, width: '100%', ...Shadow.lg },
  backToLogin: { alignItems: 'center', marginTop: Spacing.md },
  backToLoginText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm }
});
