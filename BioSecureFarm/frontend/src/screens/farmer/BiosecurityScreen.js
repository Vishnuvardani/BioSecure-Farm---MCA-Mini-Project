import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { biosecurityAPI, farmAPI } from '../../services/api';
import { Button, Header, Card } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const PARAMETERS = [
  { key: 'farmHygiene', label: 'Farm Hygiene', max: 20, icon: '🧹', desc: 'Cleanliness of farm premises' },
  { key: 'waterQuality', label: 'Water Quality', max: 15, icon: '💧', desc: 'Quality of water supply' },
  { key: 'feedManagement', label: 'Feed Management', max: 15, icon: '🌾', desc: 'Feed storage and quality' },
  { key: 'visitorControl', label: 'Visitor Control', max: 15, icon: '🚪', desc: 'Access control measures' },
  { key: 'wasteDisposal', label: 'Waste Disposal', max: 15, icon: '♻️', desc: 'Waste management system' },
  { key: 'vaccinationCompliance', label: 'Vaccination', max: 20, icon: '💉', desc: 'Vaccination compliance rate' }
];

export default function BiosecurityScreen({ navigation }) {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    farmAPI.getAll().then(r => setFarms(r.data || [])).catch(() => {});
  }, []);

  const setScore = (key, val) => setScores(p => ({ ...p, [key]: Math.min(val, PARAMETERS.find(p => p.key === key).max) }));

  const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
  const riskLevel = totalScore >= 81 ? 'low' : totalScore >= 51 ? 'moderate' : 'high';
  const riskColor = riskLevel === 'low' ? Colors.secondary : riskLevel === 'moderate' ? Colors.warning : Colors.danger;

  const handleSubmit = async () => {
    if (!selectedFarm) return Alert.alert('Error', 'Select a farm');
    setLoading(true);
    try {
      const parameters = {};
      PARAMETERS.forEach(p => { parameters[p.key] = { score: scores[p.key] || 0 }; });
      const res = await biosecurityAPI.assess({ farm: selectedFarm, parameters });
      setResult(res.data);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Biosecurity Assessment" subtitle="AI-powered scoring" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Farm Selection */}
        <Text style={styles.sectionTitle}>Select Farm</Text>
        <View style={styles.farmRow}>
          {farms.map(f => (
            <TouchableOpacity key={f._id} style={[styles.farmChip, selectedFarm === f._id && styles.farmChipActive]} onPress={() => setSelectedFarm(f._id)}>
              <Text style={[styles.farmChipText, selectedFarm === f._id && { color: '#fff' }]}>{f.farmName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Score Display */}
        <LinearGradient colors={[riskColor, riskColor + 'CC']} style={styles.scoreBanner}>
          <Text style={styles.scoreLabel}>Total Biosecurity Score</Text>
          <Text style={styles.scoreValue}>{totalScore}/100</Text>
          <Text style={styles.riskLabel}>{riskLevel.toUpperCase()} RISK</Text>
          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: `${totalScore}%` }]} />
          </View>
        </LinearGradient>

        {/* Parameters */}
        <Text style={styles.sectionTitle}>Assessment Parameters</Text>
        {PARAMETERS.map(p => (
          <Card key={p.key} style={styles.paramCard}>
            <View style={styles.paramHeader}>
              <Text style={styles.paramEmoji}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.paramLabel}>{p.label}</Text>
                <Text style={styles.paramDesc}>{p.desc}</Text>
              </View>
              <Text style={styles.paramScore}>{scores[p.key] || 0}/{p.max}</Text>
            </View>
            <View style={styles.sliderRow}>
              {Array.from({ length: p.max + 1 }, (_, i) => i).filter(i => i % Math.ceil(p.max / 5) === 0 || i === p.max).map(val => (
                <TouchableOpacity key={val} style={[styles.scoreBtn, (scores[p.key] || 0) >= val && val > 0 && styles.scoreBtnActive]} onPress={() => setScore(p.key, val)}>
                  <Text style={[styles.scoreBtnText, (scores[p.key] || 0) >= val && val > 0 && { color: '#fff' }]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ))}

        <Button title="Submit Assessment" onPress={handleSubmit} loading={loading} icon="shield-checkmark-outline" style={{ marginTop: Spacing.md }} />

        {/* Result */}
        {result && (
          <Card style={[styles.resultCard, { borderLeftColor: riskColor, borderLeftWidth: 4 }]}>
            <Text style={styles.resultTitle}>Assessment Complete ✅</Text>
            <Text style={styles.resultScore}>Score: {result.totalScore}/100 — {result.riskLevel?.toUpperCase()} RISK</Text>
            <Text style={styles.recTitle}>Recommendations:</Text>
            {result.recommendations?.map((r, i) => (
              <View key={i} style={styles.recItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                <Text style={styles.recText}>{r}</Text>
              </View>
            ))}
          </Card>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  farmRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  farmChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  farmChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  farmChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  scoreBanner: { borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  scoreValue: { color: '#fff', fontSize: 48, fontWeight: '900' },
  riskLabel: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700', marginBottom: Spacing.sm },
  scoreBarTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  paramCard: { marginBottom: Spacing.xs },
  paramHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  paramEmoji: { fontSize: 24, marginRight: Spacing.sm },
  paramLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  paramDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },
  paramScore: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  sliderRow: { flexDirection: 'row', gap: Spacing.xs },
  scoreBtn: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: '#fff' },
  scoreBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  scoreBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
  resultCard: { marginTop: Spacing.md },
  resultTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.xs },
  resultScore: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  recTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, marginBottom: 4 },
  recText: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 }
});
