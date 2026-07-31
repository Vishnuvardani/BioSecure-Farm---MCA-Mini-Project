import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, farmAPI, diseaseAPI } from '../../services/api';
import { Card, StatCard, RiskBadge, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function VetDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [farms, setFarms] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, farmRes, diseaseRes] = await Promise.all([
        analyticsAPI.dashboard(),
        farmAPI.getAll(),
        diseaseAPI.getAll({ status: 'suspected' })
      ]);
      setStats(statsRes.data);
      setFarms(farmRes.data?.slice(0, 5) || []);
      setDiseases(diseaseRes.data?.slice(0, 3) || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#17A2B8', '#0d7a8a']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Veterinarian Portal 👨⚕️</Text>
            <Text style={styles.userName}>Dr. {user?.fullName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          {[
            { label: 'Assigned Farms', value: farms.length, icon: 'business' },
            { label: 'Suspected Cases', value: diseases.length, icon: 'bug' },
            { label: 'Vaccinations', value: stats?.vaccinationsCompleted || 0, icon: 'medical' }
          ].map(s => (
            <View key={s.label} style={styles.headerStat}>
              <Ionicons name={s.icon} size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.headerStatVal}>{s.value}</Text>
              <Text style={styles.headerStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Inspection Reports', icon: 'clipboard', color: Colors.primary, screen: 'Reports' },
            { label: 'Disease Diagnosis', icon: 'flask', color: Colors.danger, screen: 'Diagnosis' },
            { label: 'Report Outbreak', icon: 'warning', color: Colors.warning, screen: 'OutbreakReporting' },
            { label: 'GIS Map', icon: 'map', color: Colors.secondary, screen: 'Map' }
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={28} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Assigned Farms</Text>
        {farms.map(f => (
          <Card key={f._id} style={styles.farmCard}>
            <View style={styles.farmRow}>
              <Text style={styles.farmEmoji}>{f.farmType === 'pig' ? '🐷' : '🐔'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.farmName}>{f.farmName}</Text>
                <Text style={styles.farmAddr}>{f.address?.city}, {f.address?.district}</Text>
              </View>
              <RiskBadge level={f.riskLevel} />
            </View>
          </Card>
        ))}

        {diseases.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>⚠️ Suspected Disease Cases</Text>
            {diseases.map(d => (
              <Card key={d._id} style={[styles.diseaseCard, { borderLeftColor: Colors.danger, borderLeftWidth: 3 }]}>
                <Text style={styles.diseaseName}>{d.diseaseName}</Text>
                <Text style={styles.diseaseInfo}>{d.farm?.farmName} • {d.affectedCount} animals affected</Text>
                <Text style={styles.diseaseStatus}>{d.status?.toUpperCase()}</Text>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  userName: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, padding: Spacing.md },
  headerStat: { alignItems: 'center' },
  headerStatVal: { color: '#fff', fontSize: FontSize.xl, fontWeight: '900', marginTop: 4 },
  headerStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, textAlign: 'center' },
  content: { flex: 1, padding: Spacing.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  actionCard: { width: '47%', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  farmCard: { marginBottom: Spacing.xs },
  farmRow: { flexDirection: 'row', alignItems: 'center' },
  farmEmoji: { fontSize: 28, marginRight: Spacing.sm },
  farmName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  farmAddr: { fontSize: FontSize.xs, color: Colors.textSecondary },
  diseaseCard: { marginBottom: Spacing.xs },
  diseaseName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.danger },
  diseaseInfo: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  diseaseStatus: { fontSize: 10, color: Colors.warning, fontWeight: '700', marginTop: 4 }
});
