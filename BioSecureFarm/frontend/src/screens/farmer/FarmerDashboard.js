import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useDrawerStatus } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, notificationAPI } from '../../services/api';
import { Card, StatCard, RiskBadge, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const QUICK_ACTIONS = [
  { label: 'Add Farm', icon: 'add-circle', color: Colors.primary, screen: 'AddFarm' },
  { label: 'Add Animal', icon: 'paw', color: Colors.secondary, screen: 'AddLivestock' },
  { label: 'Vaccinate', icon: 'medical', color: Colors.info, screen: 'Vaccination' },
  { label: 'Biosecurity', icon: 'shield-checkmark', color: Colors.warning, screen: 'Biosecurity' },
  { label: 'AI Predict', icon: 'flask', color: '#6f42c1', screen: 'DiseasePrediction' },
  { label: 'GIS Map', icon: 'map', color: '#fd7e14', screen: 'Map' }
];

export default function FarmerDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        analyticsAPI.dashboard(),
        notificationAPI.getAll()
      ]);
      setStats(statsRes.data);
      setNotifications(notifRes.data?.slice(0, 3) || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <Loader message="Loading dashboard..." />;

  const statCards = [
    { title: 'Total Farms', value: stats?.totalFarms || 0, icon: 'business', color: Colors.primary },
    { title: 'Total Animals', value: stats?.totalAnimals || 0, icon: 'paw', color: Colors.secondary },
    { title: 'Vaccinations', value: stats?.vaccinationsCompleted || 0, icon: 'medical', color: Colors.info },
    { title: 'Disease Alerts', value: stats?.diseaseAlerts || 0, icon: 'warning', color: Colors.danger },
    { title: 'Bio Score', value: stats?.biosecurityScore || 0, icon: 'shield-checkmark', color: '#6f42c1' },
    { title: 'Due Vaccines', value: stats?.upcomingVaccinations || 0, icon: 'calendar', color: Colors.warning }
  ];

  const bioScore = stats?.biosecurityScore || 0;
  const riskLevel = bioScore >= 81 ? 'low' : bioScore >= 51 ? 'moderate' : 'high';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.biosecurityBanner}>
          <View>
            <Text style={styles.bannerLabel}>Biosecurity Score</Text>
            <Text style={styles.bannerScore}>{bioScore}/100</Text>
          </View>
          <RiskBadge level={riskLevel} />
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { width: `${bioScore}%`, backgroundColor: riskLevel === 'low' ? Colors.secondary : riskLevel === 'moderate' ? Colors.warning : Colors.danger }]} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Farm Overview</Text>
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <StatCard key={i} title={s.title} value={s.value} icon={s.icon} color={s.color} />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={28} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {notifications.map((n) => (
              <Card key={n._id} style={styles.notifCard}>
                <View style={styles.notifRow}>
                  <View style={[styles.notifDot, { backgroundColor: n.type === 'alert' ? Colors.danger : Colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  headerCenter: { flex: 1, marginHorizontal: Spacing.md },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  userName: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  biosecurityBanner: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, padding: Spacing.md },
  bannerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  bannerScore: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '900' },
  scoreBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: Spacing.xs, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  content: { flex: 1, padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: { width: '30%', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  notifCard: { marginBottom: Spacing.xs },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start' },
  notifDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: Spacing.sm },
  notifTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  notifMsg: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 }
});
