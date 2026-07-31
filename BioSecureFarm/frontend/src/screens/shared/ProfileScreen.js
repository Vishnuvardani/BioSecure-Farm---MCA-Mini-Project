import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { userAPI } from '../../services/api';
import { Input, Button, Header } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggle } = useTheme();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || '', mobile: user?.mobile || '', district: user?.district || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userAPI.update(user.id, form);
      await updateUser({ ...user, ...res.data });
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const ROLE_LABELS = { farmer: 'Farmer 👨🌾', veterinarian: 'Veterinarian 👨⚕️', government_officer: 'Government Officer 🏛️', admin: 'Administrator ⚙️' };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="My Profile" onBack={() => navigation.goBack()} rightIcon={editing ? 'close' : 'create-outline'} onRightPress={() => setEditing(!editing)} />
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.role}>{ROLE_LABELS[user?.role] || user?.role}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </LinearGradient>

        {editing ? (
          <View style={styles.editSection}>
            <Input label="Full Name" icon="person-outline" value={form.fullName} onChangeText={v => setForm(p => ({ ...p, fullName: v }))} />
            <Input label="Mobile" icon="call-outline" value={form.mobile} onChangeText={v => setForm(p => ({ ...p, mobile: v }))} keyboardType="phone-pad" />
            <Input label="District" icon="location-outline" value={form.district} onChangeText={v => setForm(p => ({ ...p, district: v }))} />
            <Button title="Save Changes" onPress={handleSave} loading={loading} icon="checkmark-circle-outline" />
          </View>
        ) : (
          <View style={styles.infoSection}>
            {[
              { icon: 'person', label: 'Full Name', value: user?.fullName },
              { icon: 'mail', label: 'Email', value: user?.email },
              { icon: 'call', label: 'Mobile', value: user?.mobile },
              { icon: 'location', label: 'District', value: user?.district || 'Not set' },
              { icon: 'shield-checkmark', label: 'Account Status', value: user?.isVerified ? 'Verified ✅' : 'Unverified' }
            ].map(item => (
              <View key={item.label} style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name={item.icon} size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={Colors.primary} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ true: Colors.primary }} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
          <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 80 },
  profileHeader: { padding: Spacing.xl, alignItems: 'center' },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, borderWidth: 3, borderColor: '#fff' },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  name: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  role: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  email: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  editSection: { padding: Spacing.md },
  infoSection: { padding: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  settingsSection: { padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  settingLabel: { fontSize: FontSize.sm, color: Colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.danger, gap: Spacing.sm },
  logoutText: { color: Colors.danger, fontSize: FontSize.md, fontWeight: '700' }
});
