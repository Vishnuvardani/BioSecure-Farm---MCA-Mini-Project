import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { livestockAPI } from '../../services/api';
import { Card, Header, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const HEALTH_COLORS = { healthy: Colors.secondary, sick: Colors.danger, quarantine: Colors.warning, deceased: Colors.textSecondary };
const SPECIES_EMOJI = { pig: '🐷', chicken: '🐔', duck: '🦆', turkey: '🦃', goose: '🪿' };

export default function LivestockScreen({ navigation }) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchAnimals = async () => {
    try {
      const params = filter !== 'all' ? { healthStatus: filter } : {};
      const res = await livestockAPI.getAll(params);
      setAnimals(res.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAnimals(); }, [filter]);

  const filters = ['all', 'healthy', 'sick', 'quarantine'];

  const renderAnimal = ({ item }) => (
    <Card style={styles.animalCard}>
      <View style={styles.animalRow}>
        <Text style={styles.animalEmoji}>{SPECIES_EMOJI[item.species] || '🐾'}</Text>
        <View style={styles.animalInfo}>
          <Text style={styles.tagId}>{item.tagId}</Text>
          <Text style={styles.species}>{item.species?.toUpperCase()} • {item.breed || 'Unknown breed'}</Text>
          <Text style={styles.farm}>{item.farm?.farmName}</Text>
        </View>
        <View style={[styles.healthBadge, { backgroundColor: (HEALTH_COLORS[item.healthStatus] || Colors.textSecondary) + '20' }]}>
          <Text style={[styles.healthText, { color: HEALTH_COLORS[item.healthStatus] || Colors.textSecondary }]}>
            {item.healthStatus?.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.animalMeta}>
        <Text style={styles.metaText}>💉 {item.vaccinationStatus?.replace('_', ' ')}</Text>
        {item.weight && <Text style={styles.metaText}>⚖️ {item.weight} kg</Text>}
        {item.gender && <Text style={styles.metaText}>♂♀ {item.gender}</Text>}
      </View>
    </Card>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header title="Livestock" subtitle={`${animals.length} animals`} onMenu={() => navigation.openDrawer()} rightIcon="add-circle" onRightPress={() => navigation.navigate('AddLivestock')} />
      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={animals}
        renderItem={renderAnimal}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnimals(); }} />}
        ListEmptyComponent={<EmptyState icon="paw-outline" title="No animals found" subtitle="Add livestock to your farms" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterRow: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.xs },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: Spacing.md, paddingTop: 0, paddingBottom: 80 },
  animalCard: { marginBottom: Spacing.xs },
  animalRow: { flexDirection: 'row', alignItems: 'center' },
  animalEmoji: { fontSize: 32, marginRight: Spacing.sm },
  animalInfo: { flex: 1 },
  tagId: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  species: { fontSize: FontSize.xs, color: Colors.textSecondary },
  farm: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  healthText: { fontSize: 10, fontWeight: '700' },
  animalMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary }
});
