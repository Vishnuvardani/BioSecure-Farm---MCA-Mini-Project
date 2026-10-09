import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Image, Alert, TextInput, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  SAMPLE_FARMS, BIOSECURITY_CRITERIA, TOTAL_MAX_SCORE, getRiskLevel,
} from './farmMonitoringData';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const PURPLE = '#6f42c1';
const LIVESTOCK_EMOJI = { pig: '🐷', poultry: '🐔', mixed: '🐷🐔' };

function SectionHeader({ title, icon }) {
  return (
    <View style={sh.wrap}>
      <View style={sh.iconBox}>
        <Ionicons name={icon} size={16} color={PURPLE} />
      </View>
      <Text style={sh.title}>{title}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, marginTop: Spacing.md },
  iconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#f3f0ff', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  title:   { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
});

function InfoRow({ label, value }) {
  return (
    <View style={ir.row}>
      <Text style={ir.label}>{label}</Text>
      <Text style={ir.value}>{value || '—'}</Text>
    </View>
  );
}
const ir = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  value: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, flex: 1.4, textAlign: 'right' },
});

function RiskBadge({ score, max = TOTAL_MAX_SCORE }) {
  const { label, color, bg } = getRiskLevel(score, max);
  return (
    <View style={[rb.wrap, { backgroundColor: bg }]}>
      <View style={[rb.dot, { backgroundColor: color }]} />
      <Text style={[rb.text, { color }]}>{label}</Text>
    </View>
  );
}
const rb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dot:  { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  text: { fontSize: FontSize.xs, fontWeight: '700' },
});

function ScoreCircle({ score, max = TOTAL_MAX_SCORE, size = 72 }) {
  const { color } = getRiskLevel(score, max);
  const pct = Math.round((score / max) * 100);
  return (
    <View style={[sc.wrap, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <Text style={[sc.score, { color, fontSize: size * 0.28 }]}>{score}</Text>
      <Text style={[sc.max, { fontSize: size * 0.14 }]}>/{max}</Text>
      <Text style={[sc.pct, { color, fontSize: size * 0.16 }]}>{pct}%</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  wrap:  { borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  score: { fontWeight: '900', lineHeight: undefined },
  max:   { color: Colors.textSecondary, marginTop: -2 },
  pct:   { fontWeight: '700', marginTop: 1 },
});

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',    label: 'Overview',   icon: 'information-circle-outline' },
  { key: 'farmer',      label: 'Farmer Asmt',icon: 'person-outline' },
  { key: 'evidence',    label: 'Evidence',   icon: 'images-outline' },
  { key: 'gov',         label: 'Gov Asmt',   icon: 'shield-checkmark-outline' },
  { key: 'history',     label: 'History',    icon: 'time-outline' },
  { key: 'comparison',  label: 'Compare',    icon: 'bar-chart-outline' },
];

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ farm }) {
  const govRisk    = getRiskLevel(farm.govAssessmentScore);
  const farmerRisk = getRiskLevel(farm.farmerAssessmentScore);
  const STATUS_CFG = {
    assessed: { label: 'Assessed',  color: '#28A745', bg: '#d4edda' },
    due:      { label: 'Due',       color: '#FFC107', bg: '#fff3cd' },
    overdue:  { label: 'Overdue',   color: '#DC3545', bg: '#f8d7da' },
  };
  const sc2 = STATUS_CFG[farm.assessmentStatus] || STATUS_CFG.assessed;

  return (
    <View>
      {/* Verified risk banner */}
      <View style={[ov.banner, { backgroundColor: govRisk.bg, borderColor: govRisk.color + '60' }]}>
        <View style={{ flex: 1 }}>
          <Text style={[ov.bannerLabel, { color: govRisk.color }]}>Current Verified Risk</Text>
          <Text style={[ov.bannerRisk, { color: govRisk.color }]}>{govRisk.label.toUpperCase()}</Text>
          <Text style={ov.bannerSub}>Gov Score: {farm.govAssessmentScore}/{TOTAL_MAX_SCORE} · Last: {farm.lastAssessmentDate}</Text>
        </View>
        <ScoreCircle score={farm.govAssessmentScore} size={72} />
      </View>

      {/* Status */}
      <View style={[ov.statusRow, { backgroundColor: sc2.bg }]}>
        <Text style={[ov.statusText, { color: sc2.color }]}>Assessment Status: {sc2.label}</Text>
        <Text style={[ov.statusText, { color: sc2.color }]}>Next Due: {farm.nextAssessmentDue}</Text>
      </View>

      <SectionHeader title="Farm Information" icon="business-outline" />
      <View style={ov.card}>
        <InfoRow label="Farm ID"           value={farm.id} />
        <InfoRow label="Farm Name"         value={farm.farmName} />
        <InfoRow label="Farmer Name"       value={farm.farmerName} />
        <InfoRow label="Contact"           value={farm.contact} />
        <InfoRow label="Email"             value={farm.email} />
        <InfoRow label="Village"           value={farm.village} />
        <InfoRow label="District"          value={farm.district} />
        <InfoRow label="State"             value={farm.state} />
        <InfoRow label="GPS"               value={`${farm.gps.lat}, ${farm.gps.lng}`} />
        <InfoRow label="Livestock Type"    value={`${LIVESTOCK_EMOJI[farm.livestockType]} ${farm.livestockType}`} />
        <InfoRow label="Total Animals"     value={farm.totalAnimals.toLocaleString()} />
        <InfoRow label="Farm Area"         value={`${farm.farmArea} acres`} />
        <InfoRow label="No. of Sheds"      value={farm.numberOfSheds} />
        <InfoRow label="Capacity"          value={farm.capacity} />
        <InfoRow label="Workers"           value={farm.numberOfWorkers} />
        <InfoRow label="Registered"        value={farm.registrationDate} />
      </View>

      <SectionHeader title="Score Summary" icon="stats-chart-outline" />
      <View style={ov.scoreRow}>
        <View style={ov.scoreBox}>
          <Text style={ov.scoreBoxLabel}>Farmer Assessment</Text>
          <ScoreCircle score={farm.farmerAssessmentScore} size={80} />
          <RiskBadge score={farm.farmerAssessmentScore} />
        </View>
        <View style={ov.scoreDivider} />
        <View style={ov.scoreBox}>
          <Text style={ov.scoreBoxLabel}>Government Assessment</Text>
          <ScoreCircle score={farm.govAssessmentScore} size={80} />
          <RiskBadge score={farm.govAssessmentScore} />
        </View>
      </View>
    </View>
  );
}
const ov = StyleSheet.create({
  banner:      { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  bannerLabel: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: 2 },
  bannerRisk:  { fontSize: FontSize.xxl, fontWeight: '900' },
  bannerSub:   { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statusRow:   { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: Spacing.xs },
  statusText:  { fontSize: FontSize.xs, fontWeight: '700' },
  card:        { backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.sm },
  scoreRow:    { flexDirection: 'row', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.sm },
  scoreBox:    { flex: 1, alignItems: 'center', gap: 8 },
  scoreBoxLabel:{ fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  scoreDivider:{ width: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.sm },
});

// ─── Farmer Assessment tab ────────────────────────────────────────────────────
function FarmerAssessmentTab({ farm }) {
  const latestFarmerAsmt = farm.history.find(h => h.type === 'farmer');
  if (!latestFarmerAsmt) return <View style={{ padding: Spacing.lg }}><Text style={{ color: Colors.textSecondary }}>No farmer assessment found.</Text></View>;

  return (
    <View>
      <View style={fa.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={fa.headerTitle}>Farmer Self-Assessment</Text>
          <Text style={fa.headerSub}>Submitted: {latestFarmerAsmt.date}</Text>
          <Text style={fa.headerSub}>By: {latestFarmerAsmt.assessedBy}</Text>
        </View>
        <ScoreCircle score={latestFarmerAsmt.totalScore} size={68} />
      </View>

      <SectionHeader title="Assessment Criteria" icon="list-outline" />
      {BIOSECURITY_CRITERIA.map(c => {
        const score = latestFarmerAsmt.scores[c.id] ?? 0;
        const pct   = (score / c.maxScore) * 100;
        const { color } = getRiskLevel(score, c.maxScore);
        return (
          <View key={c.id} style={fa.criterionCard}>
            <View style={fa.criterionHeader}>
              <Text style={fa.criterionLabel}>{c.label}</Text>
              <Text style={[fa.criterionScore, { color }]}>{score}/{c.maxScore}</Text>
            </View>
            <Text style={fa.criterionDesc}>{c.description}</Text>
            <View style={fa.barWrap}>
              <View style={[fa.barFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}

      <View style={fa.totalRow}>
        <Text style={fa.totalLabel}>Total Farmer Score</Text>
        <Text style={fa.totalVal}>{latestFarmerAsmt.totalScore} / {TOTAL_MAX_SCORE}</Text>
      </View>
      <RiskBadge score={latestFarmerAsmt.totalScore} />
    </View>
  );
}
const fa = StyleSheet.create({
  headerCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.sm },
  headerTitle:     { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  headerSub:       { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  criterionCard:   { backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.xs, ...Shadow.sm },
  criterionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  criterionLabel:  { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, flex: 1 },
  criterionScore:  { fontSize: FontSize.sm, fontWeight: '800' },
  criterionDesc:   { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 6 },
  barWrap:         { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: 3 },
  totalRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  totalLabel:      { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  totalVal:        { fontSize: FontSize.xl, fontWeight: '900', color: PURPLE },
});

// ─── Evidence tab ─────────────────────────────────────────────────────────────
function EvidenceTab({ farm }) {
  const [preview, setPreview] = useState(null);
  const [imgIdx, setImgIdx]   = useState(0);

  const allEvidence = useMemo(() => {
    const farmerAsmt = farm.history.find(h => h.type === 'farmer');
    return farmerAsmt?.evidence || [];
  }, [farm]);

  const openPreview = (idx) => { setImgIdx(idx); setPreview(true); };
  const prev = () => setImgIdx(i => Math.max(0, i - 1));
  const next = () => setImgIdx(i => Math.min(allEvidence.length - 1, i + 1));

  return (
    <View>
      <View style={ev.infoBox}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
        <Text style={ev.infoText}>
          {allEvidence.length} images uploaded by farmer. Verify that evidence supports the assessment scores.
        </Text>
      </View>

      <View style={ev.grid}>
        {allEvidence.map((img, idx) => (
          <TouchableOpacity key={img.id} style={ev.imgCard} onPress={() => openPreview(idx)}>
            <Image source={{ uri: img.url }} style={ev.img} resizeMode="cover" />
            <View style={ev.imgOverlay}>
              <Ionicons name="expand-outline" size={16} color="#fff" />
            </View>
            <View style={ev.imgInfo}>
              <Text style={ev.imgCat} numberOfLines={1}>{img.category}</Text>
              <Text style={ev.imgDate}>{img.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Full-screen preview modal */}
      <Modal visible={!!preview} transparent animationType="fade">
        <View style={ev.modalBg}>
          <TouchableOpacity style={ev.modalClose} onPress={() => setPreview(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {allEvidence[imgIdx] && (
            <>
              <Image source={{ uri: allEvidence[imgIdx].url }} style={ev.fullImg} resizeMode="contain" />
              <View style={ev.modalInfo}>
                <Text style={ev.modalCat}>{allEvidence[imgIdx].category}</Text>
                <Text style={ev.modalDesc}>{allEvidence[imgIdx].description}</Text>
                <Text style={ev.modalDate}>{allEvidence[imgIdx].date}</Text>
              </View>
              <View style={ev.navRow}>
                <TouchableOpacity style={[ev.navBtn, imgIdx === 0 && ev.navBtnDisabled]} onPress={prev}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={ev.navCount}>{imgIdx + 1} / {allEvidence.length}</Text>
                <TouchableOpacity style={[ev.navBtn, imgIdx === allEvidence.length - 1 && ev.navBtnDisabled]} onPress={next}>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}
const ev = StyleSheet.create({
  infoBox:      { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#e3f2fd', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  infoText:     { flex: 1, fontSize: FontSize.xs, color: Colors.info },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  imgCard:      { width: (SW - Spacing.md * 2 - Spacing.md * 2 - Spacing.sm) / 2, borderRadius: BorderRadius.md, overflow: 'hidden', backgroundColor: '#fff', ...Shadow.sm },
  img:          { width: '100%', height: 110 },
  imgOverlay:   { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: 4 },
  imgInfo:      { padding: 8 },
  imgCat:       { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
  imgDate:      { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },
  modalBg:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalClose:   { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  fullImg:      { width: SW, height: SW * 0.75 },
  modalInfo:    { padding: Spacing.md, alignItems: 'center' },
  modalCat:     { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
  modalDesc:    { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'center' },
  modalDate:    { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  navRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, marginTop: Spacing.md },
  navBtn:       { padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24 },
  navBtnDisabled:{ opacity: 0.3 },
  navCount:     { fontSize: FontSize.md, color: '#fff', fontWeight: '700' },
});

export { OverviewTab, FarmerAssessmentTab, EvidenceTab };
export default function FarmMonitoringDetail() { return null; }
