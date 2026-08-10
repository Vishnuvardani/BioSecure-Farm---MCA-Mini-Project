import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { farmAPI } from '../../services/api';
import { Input, Button, Header } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const FARM_TYPES = [
  { value: 'pig', label: 'Pig Farm', emoji: '🐷' },
  { value: 'poultry', label: 'Poultry Farm', emoji: '🐔' },
  { value: 'mixed', label: 'Mixed Farm', emoji: '🐷🐔' }
];

export default function AddFarmScreen({ navigation }) {
  const [form, setForm] = useState({ farmName: '', farmType: '', totalArea: '', capacity: '', address: { street: '', city: '', district: '', state: '', pincode: '' } });
  const [loading, setLoading] = useState(false);
  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setAddr = (key, val) => setForm(p => ({ ...p, address: { ...p.address, [key]: val } }));

  const handleSubmit = async () => {
    if (!form.farmName || !form.farmType) return Alert.alert('Error', 'Farm name and type are required');
    setLoading(true);
    try {
      await farmAPI.create({ ...form, totalArea: Number(form.totalArea), capacity: Number(form.capacity) });
      Alert.alert('Success', 'Farm registered successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Add New Farm" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Farm Name *" icon="business-outline" value={form.farmName} onChangeText={v => set('farmName', v)} placeholder="Enter farm name" />

        <Text style={styles.label}>Farm Type *</Text>
        <View style={styles.typeRow}>
          {FARM_TYPES.map(t => (
            <TouchableOpacity key={t.value} style={[styles.typeCard, form.farmType === t.value && styles.typeCardActive]} onPress={() => set('farmType', t.value)}>
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, form.farmType === t.value && { color: Colors.primary }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Input label="Total Area (acres)" icon="resize-outline" value={form.totalArea} onChangeText={v => set('totalArea', v)} placeholder="0" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Capacity" icon="people-outline" value={form.capacity} onChangeText={v => set('capacity', v)} placeholder="0" keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>📍 Farm Address</Text>
        <Input label="Street" icon="location-outline" value={form.address.street} onChangeText={v => setAddr('street', v)} placeholder="Street address" />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Input label="City" value={form.address.city} onChangeText={v => setAddr('city', v)} placeholder="City" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="District" value={form.address.district} onChangeText={v => setAddr('district', v)} placeholder="District" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Input label="State" value={form.address.state} onChangeText={v => setAddr('state', v)} placeholder="State" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Pincode" value={form.address.pincode} onChangeText={v => setAddr('pincode', v)} placeholder="000000" keyboardType="numeric" />
          </View>
        </View>

        <Button title="Register Farm" onPress={handleSubmit} loading={loading} icon="checkmark-circle-outline" style={{ marginTop: Spacing.md }} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  typeCard: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.background },
  typeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeEmoji: { fontSize: 28, marginBottom: 4 },
  typeLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  row: { flexDirection: 'row' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginVertical: Spacing.sm }
});
