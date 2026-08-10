import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { farmAPI } from '../../services/api';
import { Header, Card, EmptyState, Loader, RiskBadge } from '../../components/UIComponents';
import { Colors, Spacing, FontSize } from '../../theme';

export default function ComplianceScreen({ navigation }) {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFarms = async () => {
    try {
      const res = await farmAPI.getAll();
      setFarms(res.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchFarms(); }, []);

  const getComplianceStatus = (score) => score >= 81 ? { label: 'Compliant', color: Colors.secondary } : score >= 51 ? { label: 'Partial', color: Colors.warning } : { label: 'Non-Compliant', color: Colors.danger };

  if (loading) return <Loader />;

  const compliant = farms.filter(f => f.biosecurityScore >= 81).length;
  const nonCompliant = farms.filter(f => f.biosecurityScore < 51).length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Compliance Monitoring" subtitle={`${farms.length} farms monitored`} onBack={() => navigation.goBack()} />
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: Colors.secondaryLight }]}>
          <Text style={[styles.summaryVal, { color: Colors.secondary }]}>{compliant}</Text>
          <Text style={styles.summaryLabel}>Compliant</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fff3cd' }]}>
          <Text style={[styles.summaryVal, { color: Colors.warning }]}>{farms.length - compliant - nonCompliant}</Text>
          <Text style={styles.summaryLabel}>Partial</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#f8d7da' }]}>
          <Text style={[styles.summaryVal, { color: Colors.danger }]}>{nonCompliant}</Text>
          <Text style={styles.summaryLabel}>Non-Compliant</Text>
        </View>
      </View>
      <FlatList
        data={farms}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFarms(); }} />}
        ListEmptyComponent={<EmptyState icon="shield-outline" title="No farms to monitor" />}
        renderItem={({ item }) => {
          const compliance = getComplianceStatus(item.biosecurityScore);
          return (
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.farmEmoji}>{item.farmType === 'pig' ? '🐷' : '🐔'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.farmName}>{item.farmName}</Text>
                  <Text style={styles.farmAddr}>{item.address?.district}</Text>
                </View>
                <View>
                  <Text style={styles.score}>{item.biosecurityScore}/100</Text>
                  <View style={[styles.complianceBadge, { backgroundColor: compliance.color + '20' }]}>
                    <Text style={[styles.complianceText, { color: compliance.color }]}>{compliance.label}</Text>
                  </View>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm },
  summaryCard: { flex: 1, borderRadius: 12, padding: Spacing.md, alignItems: 'center' },
  summaryVal: { fontSize: 28, fontWeight: '900' },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  card: { marginBottom: Spacing.xs },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  farmEmoji: { fontSize: 28, marginRight: Spacing.sm },
  farmName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  farmAddr: { fontSize: FontSize.xs, color: Colors.textSecondary },
  score: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, textAlign: 'right' },
  complianceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginTop: 2 },
  complianceText: { fontSize: 10, fontWeight: '700' }
});
