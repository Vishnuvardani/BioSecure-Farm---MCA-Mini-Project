import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../../services/api';
import { Input, Button } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

export default function ResetPasswordScreen({ navigation, route }) {
  const { userId, otp } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirm) return Alert.alert('Error', 'Fill all fields');
    if (newPassword !== confirm) return Alert.alert('Error', 'Passwords do not match');
    if (newPassword.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await authAPI.resetPassword({ userId, otp, newPassword });
      Alert.alert('Success', 'Password reset successfully!', [{ text: 'Login', onPress: () => navigation.navigate('Login') }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D6EFD', '#0A58CA', '#1a6b3a']} style={{ flex: 1, justifyContent: 'center', padding: Spacing.lg }}>
      <Text style={styles.icon}>🔑</Text>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Create a new secure password</Text>
      <View style={styles.card}>
        <Input label="New Password" icon="lock-closed-outline" value={newPassword} onChangeText={setNewPassword} placeholder="Min 6 characters" secureTextEntry />
        <Input label="Confirm Password" icon="lock-closed-outline" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" secureTextEntry />
        <Button title="Reset Password" onPress={handleReset} loading={loading} icon="checkmark-circle-outline" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 56, textAlign: 'center', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: Spacing.xl },
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.lg }
});
