import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, diseaseAPI, reportAPI } from '../../services/api';
import { Card, StatCard, RiskBadge, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function GovDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, diseaseRes, distRes] = await Promise.all([
        analyticsAPI.dashboard(),
        diseaseAPI.getAll({ status: 'confirmed' }),
        analyticsAPI.district()
      ]);
      setStats(statsRes.data);
      setOutbreaks(diseaseRes.data?.slice(0, 5) || []);
      setDistrictData(distRes.data?.slice(0, 5) || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6f42c1', '#4a1d96']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Government Portal 🏛️</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.district}>{user?.district || 'All Districts'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
        <View style={styles.statsGrid}>
          {[
            { title: 'Total Farms', value: stats?.totalFarms || 0, icon: 'business', color: Colors.primary },
            { title: 'Total Animals', value: stats?.totalAnimals || 0, icon: 'paw', color: Colors.secondary },
            { title: 'Active Outbreaks', value: outbreaks.length, icon: 'warning', color: Colors.danger },
            { title: 'Disease Alerts', value: stats?.diseaseAlerts || 0, icon: 'bug', color: Colors.warning }
          ].map((s, i) => <StatCard key={i} {...s} />)}
        </View>

        <View style={styles.actionsGrid}>
          {[
            { label: 'Outbreak Monitor', icon: 'warning', color: Colors.danger, screen: 'Outbreaks' },
            { label: 'Compliance', icon: 'shield-checkmark', color: Colors.secondary, screen: 'Compliance' },
            { label: 'GIS Hotspots', icon: 'map', color: Colors.primary, screen: 'Map' },
            { label: 'Analytics', icon: 'bar-chart', color: '#6f42c1', screen: 'Analytics' }
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={26} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Active Outbreaks</Text>
        {outbreaks.map(d => (
          <Card key={d._id} style={[styles.outbreakCard, { borderLeftColor: Colors.danger, borderLeftWidth: 3 }]}>
            <Text style={styles.outbreakName}>{d.diseaseName}</Text>
            <Text style={styles.outbreakInfo}>{d.farm?.farmName} • {d.affectedCount} animals</Text>
            <Text style={styles.outbreakSeverity}>Severity: {d.severity?.toUpperCase()}</Text>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>District Overview</Text>
        {districtData.map((d, i) => (
          <Card key={i} style={styles.districtCard}>
            <View style={styles.districtRow}>
              <Text style={styles.districtName}>{d._id || 'Unknown'}</Text>
              <Text style={styles.districtCount}>{d.count} farms</Text>
              <Text style={styles.districtScore}>Score: {Math.round(d.avgBioScore || 0)}</Text>
            </View>
          </Card>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  userName: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
  district: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs },
  content: { flex: 1, padding: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs, marginBottom: Spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  actionCard: { width: '47%', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  outbreakCard: { marginBottom: Spacing.xs },
  outbreakName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.danger },
  outbreakInfo: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  outbreakSeverity: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: '700', marginTop: 2 },
  districtCard: { marginBottom: Spacing.xs },
  districtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  districtName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, flex: 1 },
  districtCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  districtScore: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' }
});
