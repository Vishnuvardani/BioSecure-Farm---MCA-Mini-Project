import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const menuItems = {
  farmer: [
    { label: 'Dashboard', icon: 'home', screen: 'FarmerTabs' },
    { label: 'My Farms', icon: 'business', screen: 'Farms' },
    { label: 'Livestock', icon: 'paw', screen: 'Livestock' },
    { label: 'Vaccinations', icon: 'medical', screen: 'Vaccination' },
    { label: 'Biosecurity', icon: 'shield-checkmark', screen: 'Biosecurity' },
    { label: 'Disease Prediction', icon: 'flask', screen: 'DiseasePrediction' },
    { label: 'GIS Map', icon: 'map', screen: 'Map' },
    { label: 'Reports', icon: 'document-text', screen: 'Reports' },
    { label: 'Notifications', icon: 'notifications', screen: 'Notifications' },
    { label: 'Profile', icon: 'person', screen: 'Profile' }
  ]
};

export default function DrawerContent(props) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  const items = menuItems[user?.role] || [];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.role}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <ScrollView style={styles.menu}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => props.navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={22} color={Colors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.themeToggle} onPress={toggle}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.textSecondary} />
          <Text style={styles.themeText}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.lg, paddingTop: 50, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  role: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, marginTop: 2 },
  email: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs, marginTop: 2 },
  menu: { flex: 1, paddingTop: Spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel: { marginLeft: Spacing.md, fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  themeToggle: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  themeText: { marginLeft: Spacing.sm, color: Colors.textSecondary, fontSize: FontSize.sm },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, marginTop: Spacing.xs },
  logoutText: { marginLeft: Spacing.sm, color: Colors.danger, fontSize: FontSize.md, fontWeight: '600' }
});
