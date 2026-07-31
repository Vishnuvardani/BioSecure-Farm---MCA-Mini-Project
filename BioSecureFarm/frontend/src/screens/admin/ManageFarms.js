import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { farmAPI } from '../../services/api';
import { Header, Card, EmptyState, Loader, RiskBadge } from '../../components/UIComponents';
import { Colors, Spacing, FontSize } from '../../theme';

export default function ManageFarms({ navigation }) {
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

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Manage Farms" subtitle={`${farms.length} farms`} onBack={() => navigation.goBack()} />
      <FlatList
        data={farms}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFarms(); }} />}
        ListEmptyComponent={<EmptyState icon="business-outline" title="No farms registered" />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.emoji}>{item.farmType === 'pig' ? '🐷' : item.farmType === 'poultry' ? '🐔' : '🐷🐔'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.farmName}>{item.farmName}</Text>
                <Text style={styles.owner}>Owner: {item.owner?.fullName}</Text>
                <Text style={styles.addr}>{item.address?.city}, {item.address?.district}</Text>
              </View>
              <View style={styles.right}>
                <RiskBadge level={item.riskLevel} />
                <Text style={styles.score}>{item.biosecurityScore}/100</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 28, marginRight: Spacing.sm },
  farmName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  owner: { fontSize: FontSize.xs, color: Colors.primary },
  addr: { fontSize: FontSize.xs, color: Colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 4 },
  score: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary }
});
