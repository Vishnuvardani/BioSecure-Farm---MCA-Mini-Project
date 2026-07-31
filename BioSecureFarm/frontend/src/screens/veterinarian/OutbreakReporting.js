import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { diseaseAPI, farmAPI } from '../../services/api';
import { Input, Button, Header } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const DISEASE_TYPES = ['bird_flu', 'african_swine_fever', 'foot_and_mouth', 'newcastle', 'other'];
const SEVERITIES = ['low', 'moderate', 'high', 'critical'];

export default function OutbreakReporting({ navigation }) {
  const [form, setForm] = useState({ farm: '', diseaseName: '', diseaseType: '', affectedCount: '', severity: 'moderate', symptoms: '', notes: '' });
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    farmAPI.getAll().then(r => setFarms(r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.farm || !form.diseaseName) return Alert.alert('Error', 'Farm and disease name required');
    setLoading(true);
    try {
      await diseaseAPI.report({
        ...form,
        affectedCount: Number(form.affectedCount),
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        isOutbreak: true,
        status: 'suspected'
      });
      Alert.alert('Reported', 'Outbreak reported and authorities notified!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
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
          <TouchableOpacity key={o} style={[styles.chip, value === o && styles.chipActive]} onPress={() => onSelect(o)}>
            <Text style={[styles.chipText, value === o && { color: '#fff' }]}>{o.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Report Outbreak" subtitle="Notify authorities immediately" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>Reporting an outbreak will immediately notify government authorities and nearby farms.</Text>
        </View>

        <Text style={styles.label}>Select Farm *</Text>
        <View style={styles.optionRow}>
          {farms.map(f => (
            <TouchableOpacity key={f._id} style={[styles.chip, form.farm === f._id && styles.chipActive]} onPress={() => set('farm', f._id)}>
              <Text style={[styles.chipText, form.farm === f._id && { color: '#fff' }]}>{f.farmName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Disease Name *" icon="bug-outline" value={form.diseaseName} onChangeText={v => set('diseaseName', v)} placeholder="e.g. Bird Flu H5N1" />
        <SelectRow label="Disease Type" options={DISEASE_TYPES} value={form.diseaseType} onSelect={v => set('diseaseType', v)} />
        <SelectRow label="Severity *" options={SEVERITIES} value={form.severity} onSelect={v => set('severity', v)} />
        <Input label="Affected Animal Count" icon="paw-outline" value={form.affectedCount} onChangeText={v => set('affectedCount', v)} keyboardType="numeric" placeholder="0" />
        <Input label="Symptoms (comma separated)" icon="list-outline" value={form.symptoms} onChangeText={v => set('symptoms', v)} placeholder="fever, respiratory distress, ..." />
        <Input label="Additional Notes" icon="document-text-outline" value={form.notes} onChangeText={v => set('notes', v)} placeholder="Any additional observations" multiline />

        <Button title="🚨 Report Outbreak" onPress={handleSubmit} loading={loading} variant="danger" style={{ marginTop: Spacing.md }} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md },
  warningBanner: { flexDirection: 'row', backgroundColor: Colors.danger + '15', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.danger + '40' },
  warningIcon: { fontSize: 24, marginRight: Spacing.sm },
  warningText: { flex: 1, fontSize: FontSize.xs, color: Colors.danger, fontWeight: '600' },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  selectGroup: { marginBottom: Spacing.md },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text }
});
