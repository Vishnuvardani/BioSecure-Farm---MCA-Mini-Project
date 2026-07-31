import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, userAPI } from '../../services/api';
import { Card, StatCard, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, userRes] = await Promise.all([analyticsAPI.dashboard(), userAPI.getStats()]);
      setStats(dashRes.data);
      setUserStats(userRes.data);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#343a40', '#212529']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Admin Control Panel ⚙️</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.systemStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>System Online • All services running</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsGrid}>
          {[
            { title: 'Total Users', value: userStats?.total || 0, icon: 'people', color: Colors.primary },
            { title: 'Total Farms', value: stats?.totalFarms || 0, icon: 'business', color: Colors.secondary },
            { title: 'Total Animals', value: stats?.totalAnimals || 0, icon: 'paw', color: Colors.info },
            { title: 'Disease Alerts', value: stats?.diseaseAlerts || 0, icon: 'warning', color: Colors.danger }
          ].map((s, i) => <StatCard key={i} {...s} />)}
        </View>

        <Text style={styles.sectionTitle}>User Distribution</Text>
        {userStats?.byRole?.map((r, i) => (
          <Card key={i} style={styles.roleCard}>
            <View style={styles.roleRow}>
              <Text style={styles.roleEmoji}>{r._id === 'farmer' ? '👨🌾' : r._id === 'veterinarian' ? '👨⚕️' : r._id === 'government_officer' ? '🏛️' : '⚙️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleName}>{r._id?.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.roleCount}>{r.active} active / {r.count} total</Text>
              </View>
              <View style={styles.roleBar}>
                <View style={[styles.roleBarFill, { width: `${(r.active / r.count) * 100}%` }]} />
              </View>
            </View>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>Quick Admin Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Manage Users', icon: 'people', color: Colors.primary, screen: 'Users' },
            { label: 'Manage Farms', icon: 'business', color: Colors.secondary, screen: 'Farms' },
            { label: 'Analytics', icon: 'bar-chart', color: '#6f42c1', screen: 'Analytics' },
            { label: 'System Logs', icon: 'list', color: Colors.textSecondary, screen: 'Logs' },
            { label: 'Notifications', icon: 'notifications', color: Colors.warning, screen: 'Notifications' },
            { label: 'Profile', icon: 'person', color: Colors.info, screen: 'Profile' }
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={26} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  userName: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
  systemStatus: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  statusText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs },
  content: { flex: 1, padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  roleCard: { marginBottom: Spacing.xs },
  roleRow: { flexDirection: 'row', alignItems: 'center' },
  roleEmoji: { fontSize: 28, marginRight: Spacing.sm },
  roleName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  roleCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  roleBar: { width: 60, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  roleBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: { width: '30%', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' }
});
