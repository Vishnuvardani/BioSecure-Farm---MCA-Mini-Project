import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { farmAPI } from '../../services/api';
import { Card, Header, RiskBadge, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function FarmListScreen({ navigation }) {
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

  const renderFarm = ({ item }) => (
    <Card style={styles.farmCard}>
      <View style={styles.farmHeader}>
        <View style={styles.farmIcon}>
          <Text style={styles.farmEmoji}>{item.farmType === 'pig' ? '🐷' : item.farmType === 'poultry' ? '🐔' : '🐷🐔'}</Text>
        </View>
        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>{item.farmName}</Text>
          <Text style={styles.farmReg}>#{item.registrationNumber}</Text>
          <Text style={styles.farmAddress}>{item.address?.city}, {item.address?.district}</Text>
        </View>
        <RiskBadge level={item.riskLevel} />
      </View>
      <View style={styles.farmStats}>
        <View style={styles.farmStat}>
          <Ionicons name="paw" size={16} color={Colors.secondary} />
          <Text style={styles.farmStatText}>{item.currentCount} Animals</Text>
        </View>
        <View style={styles.farmStat}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
          <Text style={styles.farmStatText}>Score: {item.biosecurityScore}</Text>
        </View>
        <View style={styles.farmStat}>
          <Ionicons name="resize" size={16} color={Colors.info} />
          <Text style={styles.farmStatText}>{item.totalArea} acres</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header title="My Farms" subtitle={`${farms.length} farms registered`} onMenu={() => navigation.openDrawer()} rightIcon="add-circle" onRightPress={() => navigation.navigate('AddFarm')} />
      <FlatList
        data={farms}
        renderItem={renderFarm}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFarms(); }} />}
        ListEmptyComponent={<EmptyState icon="business-outline" title="No farms yet" subtitle="Tap + to add your first farm" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: 80 },
  farmCard: { marginBottom: Spacing.sm },
  farmHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  farmIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  farmEmoji: { fontSize: 24 },
  farmInfo: { flex: 1 },
  farmName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  farmReg: { fontSize: FontSize.xs, color: Colors.textSecondary },
  farmAddress: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  farmStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  farmStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmStatText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' }
});
