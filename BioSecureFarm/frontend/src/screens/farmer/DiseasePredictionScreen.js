import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { biosecurityAPI } from '../../services/api';
import { Button, Header, Card } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const SYMPTOMS = {
  pig: ['high_fever', 'skin_hemorrhage', 'loss_of_appetite', 'vomiting', 'blisters_mouth', 'lameness', 'drooling'],
  poultry: ['respiratory_distress', 'sudden_death', 'swollen_head', 'decreased_egg_production', 'nasal_discharge', 'diarrhea']
};
const SEASONS = ['summer', 'winter', 'monsoon', 'autumn'];

export default function DiseasePredictionScreen({ navigation }) {
  const [species, setSpecies] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [biosecurityScore, setBiosecurityScore] = useState(50);
  const [vaccinationRate, setVaccinationRate] = useState(70);
  const [nearbyOutbreaks, setNearbyOutbreaks] = useState(0);
  const [season, setSeason] = useState('summer');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const toggleSymptom = (s) => setSelectedSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handlePredict = async () => {
    if (!species) return Alert.alert('Error', 'Select animal species');
    setLoading(true);
    try {
      const res = await biosecurityAPI.predict({ species, symptoms: selectedSymptoms, biosecurityScore, vaccinationRate, nearbyOutbreaks, season });
      setPredictions(res.data.predictions);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => level === 'high' ? Colors.danger : level === 'moderate' ? Colors.warning : Colors.secondary;

  const symptomList = species === 'pig' ? SYMPTOMS.pig : species ? SYMPTOMS.poultry : [];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="AI Disease Prediction" subtitle="Random Forest & Decision Tree" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={['#6f42c1', '#4a1d96']} style={styles.aiBanner}>
          <Text style={styles.aiIcon}>🤖</Text>
          <Text style={styles.aiTitle}>AI-Powered Disease Risk Analysis</Text>
          <Text style={styles.aiSubtitle}>Using Random Forest & Decision Tree algorithms</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Animal Type</Text>
        <View style={styles.speciesRow}>
          {[{ val: 'pig', emoji: '🐷', label: 'Pig' }, { val: 'chicken', emoji: '🐔', label: 'Poultry' }].map(s => (
            <TouchableOpacity key={s.val} style={[styles.speciesCard, species === s.val && styles.speciesCardActive]} onPress={() => { setSpecies(s.val); setSelectedSymptoms([]); }}>
              <Text style={styles.speciesEmoji}>{s.emoji}</Text>
              <Text style={[styles.speciesLabel, species === s.val && { color: Colors.primary }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {symptomList.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Observed Symptoms</Text>
            <View style={styles.symptomsGrid}>
              {symptomList.map(s => (
                <TouchableOpacity key={s} style={[styles.symptomChip, selectedSymptoms.includes(s) && styles.symptomChipActive]} onPress={() => toggleSymptom(s)}>
                  <Text style={[styles.symptomText, selectedSymptoms.includes(s) && { color: '#fff' }]}>{s.replace(/_/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Risk Factors</Text>
        <Card>
          <View style={styles.sliderItem}>
            <Text style={styles.sliderLabel}>Biosecurity Score: <Text style={styles.sliderVal}>{biosecurityScore}</Text></Text>
            <View style={styles.btnRow}>
              {[20, 40, 60, 80, 100].map(v => (
                <TouchableOpacity key={v} style={[styles.valBtn, biosecurityScore === v && styles.valBtnActive]} onPress={() => setBiosecurityScore(v)}>
                  <Text style={[styles.valBtnText, biosecurityScore === v && { color: '#fff' }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.sliderItem}>
            <Text style={styles.sliderLabel}>Vaccination Rate: <Text style={styles.sliderVal}>{vaccinationRate}%</Text></Text>
            <View style={styles.btnRow}>
              {[20, 40, 60, 80, 100].map(v => (
                <TouchableOpacity key={v} style={[styles.valBtn, vaccinationRate === v && styles.valBtnActive]} onPress={() => setVaccinationRate(v)}>
                  <Text style={[styles.valBtnText, vaccinationRate === v && { color: '#fff' }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.sliderItem}>
            <Text style={styles.sliderLabel}>Nearby Outbreaks: <Text style={styles.sliderVal}>{nearbyOutbreaks}</Text></Text>
            <View style={styles.btnRow}>
              {[0, 1, 2, 3, 5].map(v => (
                <TouchableOpacity key={v} style={[styles.valBtn, nearbyOutbreaks === v && styles.valBtnActive]} onPress={() => setNearbyOutbreaks(v)}>
                  <Text style={[styles.valBtnText, nearbyOutbreaks === v && { color: '#fff' }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.sliderItem}>
            <Text style={styles.sliderLabel}>Season</Text>
            <View style={styles.btnRow}>
              {SEASONS.map(s => (
                <TouchableOpacity key={s} style={[styles.valBtn, season === s && styles.valBtnActive]} onPress={() => setSeason(s)}>
                  <Text style={[styles.valBtnText, season === s && { color: '#fff' }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Button title="Run AI Prediction" onPress={handlePredict} loading={loading} icon="flask-outline" style={{ marginTop: Spacing.md }} />

        {predictions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Prediction Results</Text>
            {predictions.map((p, i) => (
              <Card key={i} style={[styles.predCard, { borderLeftColor: getRiskColor(p.riskLevel), borderLeftWidth: 4 }]}>
                <View style={styles.predHeader}>
                  <Text style={styles.predDisease}>{p.disease}</Text>
                  <View style={[styles.probBadge, { backgroundColor: getRiskColor(p.riskLevel) }]}>
                    <Text style={styles.probText}>{p.probability}%</Text>
                  </View>
                </View>
                <View style={styles.probBar}>
                  <View style={[styles.probBarFill, { width: `${p.probability}%`, backgroundColor: getRiskColor(p.riskLevel) }]} />
                </View>
                <Text style={[styles.riskText, { color: getRiskColor(p.riskLevel) }]}>⚠️ {p.riskLevel.toUpperCase()} RISK</Text>
                <Text style={styles.recTitle}>Recommendations:</Text>
                {p.recommendations?.map((r, j) => (
                  <Text key={j} style={styles.recItem}>• {r}</Text>
                ))}
              </Card>
            ))}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md },
  aiBanner: { borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md },
  aiIcon: { fontSize: 40, marginBottom: Spacing.xs },
  aiTitle: { color: '#fff', fontSize: FontSize.md, fontWeight: '800', textAlign: 'center' },
  aiSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  speciesRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  speciesCard: { flex: 1, alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: Colors.border, backgroundColor: '#fff' },
  speciesCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  speciesEmoji: { fontSize: 40, marginBottom: Spacing.xs },
  speciesLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  symptomChip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  symptomChipActive: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  symptomText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  sliderItem: { marginBottom: Spacing.md },
  sliderLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  sliderVal: { color: Colors.primary },
  btnRow: { flexDirection: 'row', gap: Spacing.xs },
  valBtn: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: '#fff' },
  valBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  valBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
  predCard: { marginBottom: Spacing.sm },
  predHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  predDisease: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, flex: 1 },
  probBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  probText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '800' },
  probBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.xs },
  probBarFill: { height: '100%', borderRadius: 3 },
  riskText: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: Spacing.xs },
  recTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  recItem: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 }
});
