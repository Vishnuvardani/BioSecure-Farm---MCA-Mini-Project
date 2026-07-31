import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportAPI } from '../../services/api';
import { Header, Card, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function ReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');

  const fetchData = async () => {
    try {
      const [rRes, aRes] = await Promise.all([reportAPI.getVetReports(), reportAPI.getAlerts()]);
      setReports(rRes.data || []);
      setAlerts(aRes.data || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const SEVERITY_COLORS = { low: Colors.secondary, moderate: Colors.warning, high: Colors.danger, critical: '#6f0000' };

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Reports & Alerts" onBack={() => navigation.goBack()} />
      <View style={styles.tabBar}>
        {['reports', 'alerts'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'reports' ? '📋 Vet Reports' : '🚨 Gov Alerts'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'reports' ? (
        <FlatList
          data={reports}
          keyExtractor={i => i._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} />}
          ListEmptyComponent={<EmptyState icon="document-text-outline" title="No reports yet" />}
          renderItem={({ item }) => (
            <Card style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Ionicons name="clipboard" size={22} color={Colors.primary} />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.reportFarm}>{item.farm?.farmName}</Text>
                  <Text style={styles.reportVet}>By: {item.veterinarian?.fullName}</Text>
                </View>
                <Text style={styles.reportDate}>{new Date(item.inspectionDate).toLocaleDateString()}</Text>
              </View>
              {item.findings && <Text style={styles.reportFindings} numberOfLines={2}>{item.findings}</Text>}
              {item.treatmentRecommendations?.length > 0 && (
                <Text style={styles.recCount}>💊 {item.treatmentRecommendations.length} recommendations</Text>
              )}
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={i => i._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="warning-outline" title="No active alerts" />}
          renderItem={({ item }) => (
            <Card style={[styles.alertCard, { borderLeftColor: SEVERITY_COLORS[item.severity], borderLeftWidth: 4 }]}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[item.severity] + '20' }]}>
                  <Text style={[styles.severityText, { color: SEVERITY_COLORS[item.severity] }]}>{item.severity?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.alertMsg} numberOfLines={3}>{item.message}</Text>
              <View style={styles.alertMeta}>
                <Text style={styles.alertType}>🏷️ {item.alertType}</Text>
                {item.affectedDistricts?.length > 0 && <Text style={styles.alertDistricts}>📍 {item.affectedDistricts.join(', ')}</Text>}
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  list: { padding: Spacing.md, paddingBottom: 80 },
  reportCard: { marginBottom: Spacing.xs },
  reportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  reportFarm: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  reportVet: { fontSize: FontSize.xs, color: Colors.textSecondary },
  reportDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  reportFindings: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  recCount: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4, fontWeight: '600' },
  alertCard: { marginBottom: Spacing.xs },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  alertTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, flex: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  severityText: { fontSize: 10, fontWeight: '700' },
  alertMsg: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.xs },
  alertMeta: { flexDirection: 'row', gap: Spacing.md },
  alertType: { fontSize: FontSize.xs, color: Colors.textSecondary },
  alertDistricts: { fontSize: FontSize.xs, color: Colors.textSecondary }
});
