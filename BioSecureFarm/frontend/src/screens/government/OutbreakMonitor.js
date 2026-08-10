import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { diseaseAPI } from '../../services/api';
import { Header, Card, EmptyState, Loader, RiskBadge } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function OutbreakMonitor({ navigation }) {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchDiseases = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await diseaseAPI.getAll(params);
      setDiseases(res.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchDiseases(); }, [filter]);

  const SEVERITY_COLORS = { low: Colors.secondary, moderate: Colors.warning, high: Colors.danger, critical: '#6f0000' };

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Outbreak Monitor" subtitle={`${diseases.length} active cases`} onBack={() => navigation.goBack()} />
      <View style={styles.filterRow}>
        {['all', 'suspected', 'confirmed', 'under_treatment'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && { color: '#fff' }]}>{f.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={diseases}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDiseases(); }} />}
        ListEmptyComponent={<EmptyState icon="bug-outline" title="No outbreak cases" subtitle="All clear!" />}
        renderItem={({ item }) => (
          <Card style={[styles.card, { borderLeftColor: SEVERITY_COLORS[item.severity], borderLeftWidth: 4 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.diseaseName}>{item.diseaseName}</Text>
              <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[item.severity] + '20' }]}>
                <Text style={[styles.severityText, { color: SEVERITY_COLORS[item.severity] }]}>{item.severity?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.farmName}>{item.farm?.farmName}</Text>
            <Text style={styles.info}>Affected: {item.affectedCount} animals | Status: {item.status?.replace('_', ' ')}</Text>
            {item.isOutbreak && <Text style={styles.outbreakTag}>🚨 OUTBREAK DECLARED</Text>}
            <Text style={styles.date}>Reported: {new Date(item.createdAt).toLocaleDateString()}</Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', padding: Spacing.sm, gap: Spacing.xs, flexWrap: 'wrap' },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  card: { marginBottom: Spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  diseaseName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, flex: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  severityText: { fontSize: 10, fontWeight: '700' },
  farmName: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  info: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  outbreakTag: { fontSize: FontSize.xs, color: Colors.danger, fontWeight: '800', marginTop: 4 },
  date: { fontSize: 10, color: Colors.textLight, marginTop: 4 }
});
