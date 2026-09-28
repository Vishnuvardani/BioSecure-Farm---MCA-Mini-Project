import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { farmAPI } from '../../services/api';
import { Card, Header, Button, Input, Loader, EmptyState } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const FARM_TYPES = [
  { value: 'pig', label: 'Pig Farm', emoji: '🐷' },
  { value: 'poultry', label: 'Poultry Farm', emoji: '🐔' },
  { value: 'mixed', label: 'Mixed Farm', emoji: '🐷🐔' }
];

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      {icon && <Ionicons name={icon} size={16} color={Colors.primary} style={{ marginRight: 6 }} />}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

export default function FarmProfileScreen({ navigation }) {
  const [farms, setFarms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchFarms = async () => {
    try {
      const res = await farmAPI.getAll();
      const list = res.data || [];
      setFarms(list);
      if (!selected && list.length > 0) setSelected(list[0]);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchFarms(); }, []);

  const openEdit = () => {
    setForm({
      farmName: selected.farmName || '',
      farmType: selected.farmType || 'pig',
      totalArea: String(selected.totalArea || ''),
      capacity: String(selected.capacity || ''),
      numberOfSheds: String(selected.numberOfSheds || ''),
      numberOfWorkers: String(selected.numberOfWorkers || ''),
      address: {
        street: selected.address?.street || '',
        city: selected.address?.city || '',
        district: selected.address?.district || '',
        state: selected.address?.state || '',
        pincode: selected.address?.pincode || ''
      }
    });
    setEditModal(true);
  };

  const handleSave = async () => {
    if (!form.farmName) return Alert.alert('Error', 'Farm name is required');
    setSaving(true);
    try {
      const res = await farmAPI.update(selected._id, {
        ...form,
        totalArea: Number(form.totalArea),
        capacity: Number(form.capacity),
        numberOfSheds: Number(form.numberOfSheds),
        numberOfWorkers: Number(form.numberOfWorkers)
      });
      setSelected(res.data);
      setFarms(prev => prev.map(f => f._id === res.data._id ? res.data : f));
      setEditModal(false);
      Alert.alert('Success', 'Farm updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setAddr = (k, v) => setForm(p => ({ ...p, address: { ...p.address, [k]: v } }));

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header
        title="Farm Profile"
        subtitle={selected ? selected.farmName : 'No farm selected'}
        onBack={() => navigation.goBack()}
        rightIcon={selected ? 'create-outline' : undefined}
        onRightPress={openEdit}
      />

      {farms.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.farmTabs} contentContainerStyle={{ padding: Spacing.sm }}>
          {farms.map(f => (
            <TouchableOpacity
              key={f._id}
              style={[styles.farmTab, selected?._id === f._id && styles.farmTabActive]}
              onPress={() => setSelected(f)}
            >
              <Text style={[styles.farmTabText, selected?._id === f._id && styles.farmTabTextActive]}>
                {f.farmType === 'pig' ? '🐷' : f.farmType === 'poultry' ? '🐔' : '🐷🐔'} {f.farmName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {!selected ? (
        <EmptyState icon="business-outline" title="No farms registered" subtitle="Go to Add Farm to register your first farm" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFarms(); }} />}
        >
          {/* Farm Header Card */}
          <Card style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.heroIcon}>
                <Text style={{ fontSize: 36 }}>{selected.farmType === 'pig' ? '🐷' : selected.farmType === 'poultry' ? '🐔' : '🐷🐔'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{selected.farmName}</Text>
                <Text style={styles.heroReg}>#{selected.registrationNumber}</Text>
                <View style={[styles.typeBadge, { backgroundColor: Colors.primaryLight }]}>
                  <Text style={[styles.typeBadgeText, { color: Colors.primary }]}>{selected.farmType?.toUpperCase()}</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroStats}>
              {[
                { label: 'Animals', value: selected.currentCount || 0, icon: 'paw' },
                { label: 'Capacity', value: selected.capacity || '—', icon: 'people' },
                { label: 'Area (ac)', value: selected.totalArea || '—', icon: 'resize' },
                { label: 'Sheds', value: selected.numberOfSheds || '—', icon: 'home' },
              ].map(s => (
                <View key={s.label} style={styles.heroStat}>
                  <Ionicons name={s.icon} size={16} color={Colors.primary} />
                  <Text style={styles.heroStatVal}>{s.value}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Farm Details */}
          <Card>
            <Text style={styles.cardTitle}>📋 Farm Details</Text>
            <InfoRow label="Farm ID" value={selected.registrationNumber} icon="barcode-outline" />
            <InfoRow label="Farm Type" value={selected.farmType} icon="paw-outline" />
            <InfoRow label="Farm Size" value={selected.totalArea ? `${selected.totalArea} acres` : null} icon="resize-outline" />
            <InfoRow label="No. of Sheds" value={selected.numberOfSheds} icon="home-outline" />
            <InfoRow label="Capacity" value={selected.capacity} icon="people-outline" />
            <InfoRow label="Workers" value={selected.numberOfWorkers} icon="person-outline" />
            <InfoRow label="Registered" value={new Date(selected.createdAt).toLocaleDateString()} icon="calendar-outline" />
          </Card>

          {/* Owner Details */}
          <Card>
            <Text style={styles.cardTitle}>👨‍🌾 Farmer Details</Text>
            <InfoRow label="Name" value={selected.owner?.fullName} icon="person-outline" />
            <InfoRow label="Email" value={selected.owner?.email} icon="mail-outline" />
            <InfoRow label="Mobile" value={selected.owner?.mobile} icon="call-outline" />
          </Card>

          {/* Location */}
          <Card>
            <Text style={styles.cardTitle}>📍 Location</Text>
            <InfoRow label="Street" value={selected.address?.street} icon="location-outline" />
            <InfoRow label="City" value={selected.address?.city} icon="business-outline" />
            <InfoRow label="District" value={selected.address?.district} icon="map-outline" />
            <InfoRow label="State" value={selected.address?.state} icon="flag-outline" />
            <InfoRow label="Pincode" value={selected.address?.pincode} icon="mail-outline" />
            {selected.location?.coordinates?.[0] !== 0 && (
              <>
                <InfoRow label="Latitude" value={selected.location?.coordinates?.[1]?.toFixed(6)} icon="navigate-outline" />
                <InfoRow label="Longitude" value={selected.location?.coordinates?.[0]?.toFixed(6)} icon="navigate-outline" />
              </>
            )}
          </Card>

          {/* Biosecurity */}
          <Card>
            <Text style={styles.cardTitle}>🛡️ Biosecurity Status</Text>
            <InfoRow label="Bio Score" value={`${selected.biosecurityScore || 0}/100`} icon="shield-checkmark-outline" />
            <InfoRow label="Risk Level" value={selected.riskLevel?.toUpperCase()} icon="warning-outline" />
            <InfoRow label="Last Inspection" value={selected.lastInspection ? new Date(selected.lastInspection).toLocaleDateString() : null} icon="calendar-outline" />
          </Card>

          <Button title="Edit Farm Details" onPress={openEdit} icon="create-outline" style={{ marginTop: Spacing.sm }} />
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Farm</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input label="Farm Name *" value={form.farmName} onChangeText={v => set('farmName', v)} placeholder="Farm name" />

              <Text style={styles.label}>Farm Type</Text>
              <View style={styles.typeRow}>
                {FARM_TYPES.map(t => (
                  <TouchableOpacity key={t.value} style={[styles.typeChip, form.farmType === t.value && styles.typeChipActive]} onPress={() => set('farmType', t.value)}>
                    <Text style={[styles.typeChipText, form.farmType === t.value && { color: '#fff' }]}>{t.emoji} {t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: Spacing.xs }}>
                  <Input label="Area (acres)" value={form.totalArea} onChangeText={v => set('totalArea', v)} keyboardType="numeric" placeholder="0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Capacity" value={form.capacity} onChangeText={v => set('capacity', v)} keyboardType="numeric" placeholder="0" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: Spacing.xs }}>
                  <Input label="No. of Sheds" value={form.numberOfSheds} onChangeText={v => set('numberOfSheds', v)} keyboardType="numeric" placeholder="0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="No. of Workers" value={form.numberOfWorkers} onChangeText={v => set('numberOfWorkers', v)} keyboardType="numeric" placeholder="0" />
                </View>
              </View>

              <Text style={styles.sectionLabel}>📍 Address</Text>
              <Input label="Street" value={form.address?.street} onChangeText={v => setAddr('street', v)} placeholder="Street" />
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: Spacing.xs }}>
                  <Input label="City" value={form.address?.city} onChangeText={v => setAddr('city', v)} placeholder="City" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="District" value={form.address?.district} onChangeText={v => setAddr('district', v)} placeholder="District" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: Spacing.xs }}>
                  <Input label="State" value={form.address?.state} onChangeText={v => setAddr('state', v)} placeholder="State" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Pincode" value={form.address?.pincode} onChangeText={v => setAddr('pincode', v)} keyboardType="numeric" placeholder="000000" />
                </View>
              </View>

              <Button title="Save Changes" onPress={handleSave} loading={saving} icon="checkmark-circle-outline" style={{ marginTop: Spacing.sm }} />
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
  farmTabs: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  farmTab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, backgroundColor: Colors.background, marginRight: Spacing.xs },
  farmTabActive: { backgroundColor: Colors.primary },
  farmTabText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  farmTabTextActive: { color: '#fff' },
  content: { padding: Spacing.md, paddingBottom: 80 },
  heroCard: { marginBottom: Spacing.sm },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  heroName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  heroReg: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full, marginTop: 4 },
  typeBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  heroStat: { alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  heroStatLabel: { fontSize: 10, color: Colors.textSecondary },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, maxWidth: '55%', textAlign: 'right' },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginVertical: Spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  typeChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  row: { flexDirection: 'row' }
});
