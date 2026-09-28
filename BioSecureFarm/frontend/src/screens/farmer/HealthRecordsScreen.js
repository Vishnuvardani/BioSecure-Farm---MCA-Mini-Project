import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { healthAPI, farmAPI, livestockAPI } from '../../services/api';
import { Card, Header, Button, Input, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const CONDITIONS = ['healthy', 'mild', 'moderate', 'severe', 'critical'];
const CONDITION_COLORS = {
  healthy: Colors.secondary, mild: Colors.info, moderate: Colors.warning,
  severe: Colors.danger, critical: '#6f0000'
};
const SYMPTOMS_LIST = ['Fever', 'Coughing', 'Sneezing', 'Diarrhea', 'Loss of appetite', 'Lethargy', 'Skin lesions', 'Swollen joints', 'Respiratory distress', 'Sudden death'];

export default function HealthRecordsScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterCondition, setFilterCondition] = useState('all');
  const [form, setForm] = useState({
    farm: '', livestock: '', batchId: '', symptoms: [],
    healthCondition: 'healthy', previousIllness: '', treatment: '',
    medicine: '', veterinarian: '', remarks: '',
    date: new Date().toISOString().split('T')[0]
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSymptom = (s) => setForm(p => ({
    ...p,
    symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s]
  }));

  const fetchData = async () => {
    try {
      const [recRes, farmRes] = await Promise.all([healthAPI.getAll(), farmAPI.getAll()]);
      setRecords(recRes.data || []);
      setFarms(farmRes.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  const fetchAnimals = async (farmId) => {
    try {
      const res = await livestockAPI.getAll({ farm: farmId });
      setAnimals(res.data || []);
    } catch { }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.farm) return Alert.alert('Error', 'Please select a farm');
    setSubmitting(true);
    try {
      await healthAPI.create(form);
      setShowModal(false);
      setForm({ farm: '', livestock: '', batchId: '', symptoms: [], healthCondition: 'healthy', previousIllness: '', treatment: '', medicine: '', veterinarian: '', remarks: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterCondition === 'all' ? records : records.filter(r => r.healthCondition === filterCondition);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.conditionDot, { backgroundColor: CONDITION_COLORS[item.healthCondition] || Colors.primary }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {item.livestock ? `${item.livestock.species?.toUpperCase()} • ${item.livestock.tagId}` : item.batchId ? `Batch: ${item.batchId}` : 'General Record'}
          </Text>
          <Text style={styles.cardFarm}>{item.farm?.farmName}</Text>
        </View>
        <View style={[styles.conditionBadge, { backgroundColor: (CONDITION_COLORS[item.healthCondition] || Colors.primary) + '20' }]}>
          <Text style={[styles.conditionText, { color: CONDITION_COLORS[item.healthCondition] || Colors.primary }]}>
            {item.healthCondition?.toUpperCase()}
          </Text>
        </View>
      </View>
      {item.symptoms?.length > 0 && (
        <View style={styles.symptomsRow}>
          {item.symptoms.slice(0, 3).map(s => (
            <View key={s} style={styles.symptomChip}>
              <Text style={styles.symptomText}>{s}</Text>
            </View>
          ))}
          {item.symptoms.length > 3 && <Text style={styles.moreText}>+{item.symptoms.length - 3}</Text>}
        </View>
      )}
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>📅 {new Date(item.date).toLocaleDateString()}</Text>
        {item.veterinarian && <Text style={styles.metaText}>👨‍⚕️ {item.veterinarian}</Text>}
        {item.treatment && <Text style={styles.metaText}>💊 {item.treatment}</Text>}
      </View>
    </Card>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header title="Health Records" subtitle={`${records.length} records`} onBack={() => navigation.goBack()} rightIcon="add-circle" onRightPress={() => setShowModal(true)} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ padding: Spacing.sm }}>
        {['all', ...CONDITIONS].map(c => (
          <TouchableOpacity key={c} style={[styles.filterChip, filterCondition === c && styles.filterChipActive]} onPress={() => setFilterCondition(c)}>
            <Text style={[styles.filterText, filterCondition === c && styles.filterTextActive]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={<EmptyState icon="heart-outline" title="No health records" subtitle="Tap + to add a health record" />}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Health Record</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Select Farm *</Text>
              <View style={styles.optionRow}>
                {farms.map(f => (
                  <TouchableOpacity key={f._id} style={[styles.chip, form.farm === f._id && styles.chipActive]}
                    onPress={() => { set('farm', f._id); fetchAnimals(f._id); }}>
                    <Text style={[styles.chipText, form.farm === f._id && { color: '#fff' }]}>{f.farmName}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {animals.length > 0 && (
                <>
                  <Text style={styles.label}>Select Animal (optional)</Text>
                  <View style={styles.optionRow}>
                    {animals.slice(0, 8).map(a => (
                      <TouchableOpacity key={a._id} style={[styles.chip, form.livestock === a._id && styles.chipActive]}
                        onPress={() => set('livestock', form.livestock === a._id ? '' : a._id)}>
                        <Text style={[styles.chipText, form.livestock === a._id && { color: '#fff' }]}>{a.tagId}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Input label="Batch ID (for poultry)" value={form.batchId} onChangeText={v => set('batchId', v)} placeholder="e.g. BATCH-001" />
              <Input label="Date" value={form.date} onChangeText={v => set('date', v)} placeholder="YYYY-MM-DD" />

              <Text style={styles.label}>Health Condition *</Text>
              <View style={styles.optionRow}>
                {CONDITIONS.map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, form.healthCondition === c && { backgroundColor: CONDITION_COLORS[c], borderColor: CONDITION_COLORS[c] }]}
                    onPress={() => set('healthCondition', c)}>
                    <Text style={[styles.chipText, form.healthCondition === c && { color: '#fff' }]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Symptoms</Text>
              <View style={styles.optionRow}>
                {SYMPTOMS_LIST.map(s => (
                  <TouchableOpacity key={s} style={[styles.chip, form.symptoms.includes(s) && styles.chipActive]}
                    onPress={() => toggleSymptom(s)}>
                    <Text style={[styles.chipText, form.symptoms.includes(s) && { color: '#fff' }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label="Previous Illness" value={form.previousIllness} onChangeText={v => set('previousIllness', v)} placeholder="Any previous illness" />
              <Input label="Treatment" value={form.treatment} onChangeText={v => set('treatment', v)} placeholder="Treatment given" />
              <Input label="Medicine" value={form.medicine} onChangeText={v => set('medicine', v)} placeholder="Medicine name & dosage" />
              <Input label="Veterinarian" value={form.veterinarian} onChangeText={v => set('veterinarian', v)} placeholder="Vet name" />
              <Input label="Remarks" value={form.remarks} onChangeText={v => set('remarks', v)} placeholder="Additional notes" multiline />

              <Text style={styles.disclaimer}>⚠️ This system supports veterinary decision-making only. Always consult a licensed veterinarian for diagnosis and treatment.</Text>

              <Button title="Save Health Record" onPress={handleSubmit} loading={submitting} icon="checkmark-circle-outline" />
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
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.background, marginRight: Spacing.xs },
  filterChipActive: { backgroundColor: Colors.danger },
  filterText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: Spacing.md, paddingBottom: 80 },
  card: { marginBottom: Spacing.xs },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  conditionDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  cardFarm: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 1 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  conditionText: { fontSize: 10, fontWeight: '700' },
  symptomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.xs },
  symptomChip: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  symptomText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  moreText: { fontSize: 10, color: Colors.textSecondary, alignSelf: 'center' },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.xs },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  disclaimer: { fontSize: FontSize.xs, color: Colors.warning, backgroundColor: '#fff8e1', padding: Spacing.sm, borderRadius: BorderRadius.sm, marginVertical: Spacing.sm, lineHeight: 18 }
});
