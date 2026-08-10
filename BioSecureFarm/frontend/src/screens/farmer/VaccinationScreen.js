import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vaccinationAPI, farmAPI } from '../../services/api';
import { Card, Header, Button, Input, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function VaccinationScreen({ navigation }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState({ farm: '', vaccineName: '', disease: '', administeredDate: new Date().toISOString().split('T')[0], dosage: '', manufacturer: '', batchNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchData = async () => {
    try {
      const [vaccRes, farmRes] = await Promise.all([vaccinationAPI.getAll(), farmAPI.getAll()]);
      setVaccinations(vaccRes.data || []);
      setFarms(farmRes.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.farm || !form.vaccineName || !form.disease) return Alert.alert('Error', 'Fill required fields');
    setSubmitting(true);
    try {
      await vaccinationAPI.create({ ...form, status: 'completed' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_COLORS = { completed: Colors.secondary, scheduled: Colors.primary, missed: Colors.danger };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.vaccineIcon}>
          <Text style={{ fontSize: 24 }}>💉</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vaccineName}>{item.vaccineName}</Text>
          <Text style={styles.disease}>{item.disease}</Text>
          <Text style={styles.farm}>{item.farm?.farmName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || Colors.primary) + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || Colors.primary }]}>{item.status?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>📅 {new Date(item.administeredDate).toLocaleDateString()}</Text>
        {item.batchNumber && <Text style={styles.metaText}>🔢 {item.batchNumber}</Text>}
        {item.administeredBy && <Text style={styles.metaText}>👨‍⚕️ {item.administeredBy?.fullName}</Text>}
      </View>
    </Card>
  );

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Vaccinations" subtitle={`${vaccinations.length} records`} onBack={() => navigation.goBack()} rightIcon="add-circle" onRightPress={() => setShowModal(true)} />
      <FlatList
        data={vaccinations}
        renderItem={renderItem}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={<EmptyState icon="medical-outline" title="No vaccination records" />}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vaccination Record</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>Select Farm *</Text>
              <View style={styles.optionRow}>
                {farms.map(f => (
                  <TouchableOpacity key={f._id} style={[styles.chip, form.farm === f._id && styles.chipActive]} onPress={() => set('farm', f._id)}>
                    <Text style={[styles.chipText, form.farm === f._id && { color: '#fff' }]}>{f.farmName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Vaccine Name *" value={form.vaccineName} onChangeText={v => set('vaccineName', v)} placeholder="e.g. Newcastle Disease Vaccine" />
              <Input label="Disease *" value={form.disease} onChangeText={v => set('disease', v)} placeholder="e.g. Newcastle Disease" />
              <Input label="Date Administered *" value={form.administeredDate} onChangeText={v => set('administeredDate', v)} placeholder="YYYY-MM-DD" />
              <Input label="Dosage" value={form.dosage} onChangeText={v => set('dosage', v)} placeholder="e.g. 0.5ml" />
              <Input label="Manufacturer" value={form.manufacturer} onChangeText={v => set('manufacturer', v)} placeholder="Manufacturer name" />
              <Input label="Batch Number" value={form.batchNumber} onChangeText={v => set('batchNumber', v)} placeholder="Batch #" />
              <Button title="Save Record" onPress={handleSubmit} loading={submitting} icon="checkmark-circle-outline" />
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md, paddingBottom: 80 },
  card: { marginBottom: Spacing.xs },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  vaccineIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  vaccineName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  disease: { fontSize: FontSize.xs, color: Colors.textSecondary },
  farm: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text }
});
