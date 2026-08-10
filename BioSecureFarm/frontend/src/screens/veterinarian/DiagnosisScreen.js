import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { diseaseAPI, farmAPI } from '../../services/api';
import { Input, Button, Header, Card } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

export default function DiagnosisScreen({ navigation }) {
  const [diseases, setDiseases] = useState([]);
  useEffect(() => {
    diseaseAPI.getAll().then(r => setDiseases(r.data || [])).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Disease Diagnosis" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={styles.sectionTitle}>Active Disease Cases</Text>
        {diseases.map(d => (
          <Card key={d._id} style={[styles.card, { borderLeftColor: d.severity === 'high' || d.severity === 'critical' ? Colors.danger : Colors.warning, borderLeftWidth: 3 }]}>
            <Text style={styles.diseaseName}>{d.diseaseName}</Text>
            <Text style={styles.info}>{d.farm?.farmName} • {d.affectedCount} animals</Text>
            <Text style={styles.info}>Severity: {d.severity?.toUpperCase()} | Status: {d.status?.toUpperCase()}</Text>
            {d.symptoms?.length > 0 && <Text style={styles.symptoms}>Symptoms: {d.symptoms.join(', ')}</Text>}
          </Card>
        ))}
        {diseases.length === 0 && <Text style={styles.empty}>No active disease cases</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  card: { marginBottom: Spacing.xs },
  diseaseName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  info: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  symptoms: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xl }
});
