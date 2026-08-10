import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

export default function OTPScreen({ navigation, route }) {
  const { userId, email, isRegister } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);
  const { login } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 6) return Alert.alert('Error', 'Enter complete 6-digit OTP');
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP({ userId, otp: otpStr });
      if (isRegister) {
        await AsyncStorage.setItem('token', res.token);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        Alert.alert('Success', 'Account verified! Please login.');
      } else {
        navigation.navigate('ResetPassword', { userId, otp: otpStr });
      }
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

        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to{'\n'}<Text style={styles.email}>{email}</Text></Text>

        <View style={styles.card}>
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={r => inputs.current[idx] = r}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={v => handleChange(v.slice(-1), idx)}
                keyboardType="numeric"
                maxLength={1}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !digit && idx > 0)
                    inputs.current[idx - 1]?.focus();
                }}
              />
            ))}
          </View>

          <Button title="Verify OTP" onPress={handleVerify} loading={loading} icon="checkmark-circle-outline" style={{ marginTop: Spacing.lg }} />

          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend OTP in <Text style={styles.timer}>{timer}s</Text></Text>
            ) : (
              <TouchableOpacity onPress={() => setTimer(60)}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, paddingTop: 60, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.xl },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  icon: { fontSize: 40 },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: Spacing.xl },
  email: { fontWeight: '700', color: '#fff' },
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: BorderRadius.xl, padding: Spacing.xl, width: '100%', ...Shadow.lg },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  otpInput: { width: 48, height: 56, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: Colors.border, textAlign: 'center', fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, backgroundColor: Colors.background },
  otpInputFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  resendRow: { alignItems: 'center', marginTop: Spacing.md },
  timerText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  timer: { color: Colors.primary, fontWeight: '700' },
  resendText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm }
});
