import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { analyticsAPI, livestockAPI, vaccinationAPI, inventoryAPI, farmActivityAPI } from '../../services/api';
import { Card, StatCard, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const MODULES = [
  { label: 'Farm Profile', icon: 'business', color: Colors.primary, screen: 'FarmProfile' },
  { label: 'Livestock', icon: 'paw', color: Colors.secondary, screen: 'Livestock' },
  { label: 'Vaccination', icon: 'medical', color: Colors.info, screen: 'Vaccination' },
  { label: 'Health Records', icon: 'heart', color: Colors.danger, screen: 'HealthRecords' },
  { label: 'Biosecurity', icon: 'shield-checkmark', color: '#6f42c1', screen: 'Biosecurity' },
  { label: 'Inventory', icon: 'cube', color: '#fd7e14', screen: 'Inventory' },
  { label: 'Farm Activities', icon: 'clipboard', color: '#20c997', screen: 'FarmActivities' },
];

export default function FarmManagementScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStock, setLowStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, actRes, invRes] = await Promise.all([
        analyticsAPI.dashboard(),
        farmActivityAPI.getAll(),
        inventoryAPI.getAll()
      ]);
      setStats(dashRes.data);
      setRecentActivities((actRes.data || []).slice(0, 5));
      setLowStock((invRes.data || []).filter(i => i.isLowStock || i.isExpired).length);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const ACTIVITY_ICONS = {
    cleaning: 'water', disinfection: 'flask', vaccination: 'medical',
    vet_visit: 'person', animal_movement: 'swap-horizontal',
    feed_purchase: 'cart', mortality: 'skull', quarantine: 'lock-closed', other: 'ellipse'
  };
  const ACTIVITY_COLORS = {
    cleaning: Colors.info, disinfection: '#6f42c1', vaccination: Colors.secondary,
    vet_visit: Colors.primary, animal_movement: Colors.warning,
    feed_purchase: '#fd7e14', mortality: Colors.danger, quarantine: Colors.danger, other: Colors.textSecondary
  };

  if (loading) return <Loader message="Loading Farm Management..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.secondary, Colors.secondaryDark]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Farm Management 🌾</Text>
            <Text style={styles.headerSub}>Monitor & manage your farm</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <Text style={styles.sectionTitle}>Farm Overview</Text>
        <View style={styles.statsGrid}>
          {[
            { title: 'Total Animals', value: stats?.totalAnimals || 0, icon: 'paw', color: Colors.secondary },
            { title: 'Disease Alerts', value: stats?.diseaseAlerts || 0, icon: 'warning', color: Colors.danger },
            { title: 'Vaccinations', value: stats?.vaccinationsCompleted || 0, icon: 'medical', color: Colors.info },
            { title: 'Low Stock', value: lowStock, icon: 'cube', color: '#fd7e14' },
          ].map((s, i) => <StatCard key={i} {...s} />)}
        </View>

        {/* Module Navigation */}
        <Text style={styles.sectionTitle}>Modules</Text>
        <View style={styles.modulesGrid}>
          {MODULES.map(m => (
            <TouchableOpacity key={m.label} style={styles.moduleCard} onPress={() => navigation.navigate(m.screen)}>
              <View style={[styles.moduleIcon, { backgroundColor: m.color + '18' }]}>
                <Ionicons name={m.icon} size={28} color={m.color} />
              </View>
              <Text style={styles.moduleLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Farm Activities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FarmActivities')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentActivities.length > 0 ? recentActivities.map((a, i) => (
          <Card key={a._id || i} style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={[styles.activityIcon, { backgroundColor: (ACTIVITY_COLORS[a.activityType] || Colors.primary) + '18' }]}>
                <Ionicons name={ACTIVITY_ICONS[a.activityType] || 'ellipse'} size={18} color={ACTIVITY_COLORS[a.activityType] || Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityType}>{a.activityType?.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.activityDesc} numberOfLines={1}>{a.description}</Text>
                <Text style={styles.activityMeta}>{a.farm?.farmName} • {new Date(a.date).toLocaleDateString()}</Text>
              </View>
            </View>
          </Card>
        )) : (
          <Card style={styles.activityCard}>
            <Text style={styles.emptyText}>No activities recorded yet</Text>
          </Card>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCenter: { flex: 1, marginHorizontal: Spacing.md },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  content: { flex: 1, padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  modulesGrid: { gap: Spacing.xs },
  moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.xs, ...Shadow.sm },
  moduleIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  moduleLabel: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  activityCard: { marginBottom: Spacing.xs },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  activityType: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
  activityDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  activityMeta: { fontSize: 10, color: Colors.textLight, marginTop: 1 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.sm }
});
