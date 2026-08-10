import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { livestockAPI, farmAPI } from '../../services/api';
import { Input, Button, Header } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const SPECIES = ['pig', 'chicken', 'duck', 'turkey', 'goose'];
const GENDERS = ['male', 'female', 'unknown'];

export default function AddLivestockScreen({ navigation }) {
  const [form, setForm] = useState({ farm: '', species: '', breed: '', gender: '', weight: '', notes: '' });
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    farmAPI.getAll().then(r => setFarms(r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.farm || !form.species) return Alert.alert('Error', 'Farm and species are required');
    setLoading(true);
    try {
      await livestockAPI.add({ ...form, weight: Number(form.weight) });
      Alert.alert('Success', 'Animal added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const SelectRow = ({ label, options, value, onSelect }) => (
    <View style={styles.selectGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map(o => (
          <TouchableOpacity key={o} style={[styles.optionChip, value === o && styles.optionChipActive]} onPress={() => onSelect(o)}>
            <Text style={[styles.optionText, value === o && styles.optionTextActive]}>{o.charAt(0).toUpperCase() + o.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Add Livestock" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Select Farm *</Text>
        <View style={styles.optionRow}>
          {farms.map(f => (
            <TouchableOpacity key={f._id} style={[styles.optionChip, form.farm === f._id && styles.optionChipActive]} onPress={() => set('farm', f._id)}>
              <Text style={[styles.optionText, form.farm === f._id && styles.optionTextActive]}>{f.farmName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SelectRow label="Species *" options={SPECIES} value={form.species} onSelect={v => set('species', v)} />
        <SelectRow label="Gender" options={GENDERS} value={form.gender} onSelect={v => set('gender', v)} />

        <Input label="Breed" icon="paw-outline" value={form.breed} onChangeText={v => set('breed', v)} placeholder="e.g. Landrace, Broiler" />
        <Input label="Weight (kg)" icon="scale-outline" value={form.weight} onChangeText={v => set('weight', v)} placeholder="0" keyboardType="numeric" />
        <Input label="Notes" icon="document-text-outline" value={form.notes} onChangeText={v => set('notes', v)} placeholder="Any additional notes" multiline />

        <Button title="Add Animal" onPress={handleSubmit} loading={loading} icon="add-circle-outline" style={{ marginTop: Spacing.md }} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  selectGroup: { marginBottom: Spacing.md },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  optionChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  optionChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  optionTextActive: { color: Colors.primary }
});
