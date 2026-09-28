import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { farmActivityAPI, farmAPI } from '../../services/api';
import { Card, Header, Button, Input, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const ACTIVITY_TYPES = [
  { value: 'cleaning', label: 'Cleaning', icon: 'water', color: Colors.info },
  { value: 'disinfection', label: 'Disinfection', icon: 'flask', color: '#6f42c1' },
  { value: 'vaccination', label: 'Vaccination', icon: 'medical', color: Colors.secondary },
  { value: 'vet_visit', label: 'Vet Visit', icon: 'person', color: Colors.primary },
  { value: 'animal_movement', label: 'Animal Movement', icon: 'swap-horizontal', color: Colors.warning },
  { value: 'feed_purchase', label: 'Feed Purchase', icon: 'cart', color: '#fd7e14' },
  { value: 'mortality', label: 'Mortality', icon: 'skull', color: Colors.danger },
  { value: 'quarantine', label: 'Quarantine', icon: 'lock-closed', color: Colors.danger },
  { value: 'other', label: 'Other', icon: 'ellipse', color: Colors.textSecondary }
];

export default function FarmActivitiesScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({
    farm: '', activityType: 'cleaning', description: '',
    personResponsible: '', remarks: '',
    date: new Date().toISOString().split('T')[0]
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchData = async () => {
    try {
      const [actRes, farmRes] = await Promise.all([farmActivityAPI.getAll(), farmAPI.getAll()]);
      setActivities(actRes.data || []);
      setFarms(farmRes.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.farm || !form.description) return Alert.alert('Error', 'Farm and description are required');
    setSubmitting(true);
    try {
      await farmActivityAPI.create(form);
      setShowModal(false);
      setForm({ farm: '', activityType: 'cleaning', description: '', personResponsible: '', remarks: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterType === 'all' ? activities : activities.filter(a => a.activityType === filterType);

  const getTypeConfig = (type) => ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1];

  const renderItem = ({ item }) => {
    const cfg = getTypeConfig(item.activityType);
    return (
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.actIcon, { backgroundColor: cfg.color + '18' }]}>
            <Ionicons name={cfg.icon} size={20} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.cardTop}>
              <Text style={styles.actType}>{cfg.label}</Text>
              <Text style={styles.actDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.actDesc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.actFarm}>{item.farm?.farmName}</Text>
            {item.personResponsible && (
              <Text style={styles.actPerson}>👤 {item.personResponsible}</Text>
            )}
          </View>
        </View>
        {item.remarks && (
          <Text style={styles.actRemarks}>📝 {item.remarks}</Text>
        )}
      </Card>
    );
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header title="Farm Activities" subtitle={`${activities.length} records`} onBack={() => navigation.goBack()} rightIcon="add-circle" onRightPress={() => setShowModal(true)} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ padding: Spacing.sm }}>
        <TouchableOpacity style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]} onPress={() => setFilterType('all')}>
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {ACTIVITY_TYPES.map(t => (
          <TouchableOpacity key={t.value} style={[styles.filterChip, filterType === t.value && { backgroundColor: t.color }]} onPress={() => setFilterType(t.value)}>
            <Ionicons name={t.icon} size={12} color={filterType === t.value ? '#fff' : Colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[styles.filterText, filterType === t.value && styles.filterTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={<EmptyState icon="clipboard-outline" title="No activities recorded" subtitle="Tap + to log a farm activity" />}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Farm Activity</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Select Farm *</Text>
              <View style={styles.optionRow}>
                {farms.map(f => (
                  <TouchableOpacity key={f._id} style={[styles.chip, form.farm === f._id && styles.chipActive]} onPress={() => set('farm', f._id)}>
                    <Text style={[styles.chipText, form.farm === f._id && { color: '#fff' }]}>{f.farmName}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Activity Type *</Text>
              <View style={styles.actTypeGrid}>
                {ACTIVITY_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.actTypeCard, form.activityType === t.value && { borderColor: t.color, backgroundColor: t.color + '12' }]}
                    onPress={() => set('activityType', t.value)}
                  >
                    <Ionicons name={t.icon} size={20} color={form.activityType === t.value ? t.color : Colors.textSecondary} />
                    <Text style={[styles.actTypeLabel, form.activityType === t.value && { color: t.color }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label="Date" value={form.date} onChangeText={v => set('date', v)} placeholder="YYYY-MM-DD" />
              <Input label="Description *" value={form.description} onChangeText={v => set('description', v)} placeholder="Describe the activity..." multiline />
              <Input label="Person Responsible" value={form.personResponsible} onChangeText={v => set('personResponsible', v)} placeholder="Name of person" />
              <Input label="Remarks" value={form.remarks} onChangeText={v => set('remarks', v)} placeholder="Additional notes" multiline />

              <Button title="Save Activity" onPress={handleSubmit} loading={submitting} icon="checkmark-circle-outline" style={{ marginTop: Spacing.sm }} />
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.background, marginRight: Spacing.xs },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: Spacing.md, paddingBottom: 80 },
  card: { marginBottom: Spacing.xs },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  actIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actType: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  actDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  actDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  actFarm: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  actPerson: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  actRemarks: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.xs },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  actTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  actTypeCard: { width: '30%', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  actTypeLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center', marginTop: 4 }
});
