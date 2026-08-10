import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { reportAPI } from '../../services/api';
import { Header, Card, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize } from '../../theme';

export default function InspectionReports({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await reportAPI.getVetReports();
      setReports(res.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Inspection Reports" onBack={() => navigation.goBack()} />
      <FlatList
        data={reports}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReports(); }} />}
        ListEmptyComponent={<EmptyState icon="clipboard-outline" title="No inspection reports" />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: Spacing.xs }}>
            <Text style={styles.farmName}>{item.farm?.farmName}</Text>
            <Text style={styles.date}>📅 {new Date(item.inspectionDate).toLocaleDateString()}</Text>
            {item.findings && <Text style={styles.findings} numberOfLines={2}>{item.findings}</Text>}
            {item.diagnosis && <Text style={styles.diagnosis}>🔬 {item.diagnosis}</Text>}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  farmName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  findings: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  diagnosis: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4, fontWeight: '600' },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 6 },
  statusText: { fontSize: 10, color: Colors.primary, fontWeight: '700' }
});
