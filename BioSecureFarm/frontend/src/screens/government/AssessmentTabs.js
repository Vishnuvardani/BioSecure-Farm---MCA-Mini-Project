import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, Image, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BIOSECURITY_CRITERIA, TOTAL_MAX_SCORE, getRiskLevel } from './farmMonitoringData';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const PURPLE = '#6f42c1';
const { width: SW } = Dimensions.get('window');

// ─── History Tab ──────────────────────────────────────────────────────────────
export function HistoryTab({ farm }) {
  const [selected, setSelected] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  const TYPE_CFG = {
    government: { label: 'Government', color: PURPLE,         bg: '#f3f0ff', icon: 'shield-checkmark' },
    farmer:     { label: 'Farmer',     color: Colors.secondary, bg: '#d4edda', icon: 'person' },
  };

  const openPreview = (evidence, idx) => {
    setImgPreview(evidence);
    setImgIdx(idx);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Assessment History</Text>
      {farm.history.map((asmt, i) => {
        const cfg  = TYPE_CFG[asmt.type] || TYPE_CFG.farmer;
        const risk = getRiskLevel(asmt.totalScore);
        return (
          <View key={asmt.id} style={styles.histCard}>
            <TouchableOpacity style={styles.histHeader} onPress={() => setSelected(selected === asmt.id ? null : asmt.id)}>
              <View style={[styles.histIcon, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={18} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.histTitleRow}>
                  <View style={[styles.typePill, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.typePillText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  <Text style={styles.histDate}>{asmt.date}</Text>
                </View>
                <Text style={styles.histBy}>{asmt.assessedBy}</Text>
                <View style={styles.histScoreRow}>
                  <Text style={[styles.histScore, { color: risk.color }]}>{asmt.totalScore}/{TOTAL_MAX_SCORE}</Text>
                  <View style={[styles.riskPill, { backgroundColor: risk.bg }]}>
                    <Text style={[styles.riskPillText, { color: risk.color }]}>{risk.label}</Text>
                  </View>
                  <Text style={styles.histEvidence}>{asmt.evidence?.length || 0} photos</Text>
                </View>
              </View>
              <Ionicons
                name={selected === asmt.id ? 'chevron-up' : 'chevron-down'}
                size={18} color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {selected === asmt.id && (
              <View style={styles.histDetail}>
                {/* Criteria breakdown */}
                <Text style={styles.detailSectionLabel}>Criteria Scores</Text>
                {BIOSECURITY_CRITERIA.map(c => {
                  const s = asmt.scores[c.id] ?? 0;
                  const { color } = getRiskLevel(s, c.maxScore);
                  return (
                    <View key={c.id} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{c.label}</Text>
                      <View style={styles.detailBarWrap}>
                        <View style={[styles.detailBarFill, { width: `${(s / c.maxScore) * 100}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={[styles.detailScore, { color }]}>{s}/{c.maxScore}</Text>
                    </View>
                  );
                })}

                {/* Remarks */}
                {asmt.remarks ? (
                  <>
                    <Text style={styles.detailSectionLabel}>Remarks</Text>
                    <Text style={styles.detailRemarks}>{asmt.remarks}</Text>
                  </>
                ) : null}

                {/* Corrective actions */}
                {asmt.correctiveActions?.length > 0 && (
                  <>
                    <Text style={styles.detailSectionLabel}>Corrective Actions</Text>
                    {asmt.correctiveActions.map((a, ai) => (
                      <View key={ai} style={styles.actionRow}>
                        <View style={[styles.priorityDot, {
                          backgroundColor: a.priority === 'high' ? Colors.danger : a.priority === 'medium' ? Colors.warning : Colors.secondary
                        }]} />
                        <Text style={styles.actionText}>{a.action}</Text>
                        <View style={[styles.statusPill, { backgroundColor: a.status === 'completed' ? '#d4edda' : '#fff3cd' }]}>
                          <Text style={[styles.statusPillText, { color: a.status === 'completed' ? Colors.secondary : Colors.warning }]}>
                            {a.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {/* Evidence thumbnails */}
                {asmt.evidence?.length > 0 && (
                  <>
                    <Text style={styles.detailSectionLabel}>Evidence ({asmt.evidence.length} photos)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.thumbRow}>
                        {asmt.evidence.map((img, idx) => (
                          <TouchableOpacity key={img.id} onPress={() => openPreview(asmt.evidence, idx)}>
                            <Image source={{ uri: img.url }} style={styles.thumb} />
                            <Text style={styles.thumbLabel} numberOfLines={1}>{img.category}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </>
                )}
              </View>
            )}
          </View>
        );
      })}

      {/* Image preview modal */}
      <Modal visible={!!imgPreview} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setImgPreview(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {imgPreview?.[imgIdx] && (
            <>
              <Image source={{ uri: imgPreview[imgIdx].url }} style={styles.fullImg} resizeMode="contain" />
              <View style={styles.modalInfo}>
                <Text style={styles.modalCat}>{imgPreview[imgIdx].category}</Text>
                <Text style={styles.modalDesc}>{imgPreview[imgIdx].description}</Text>
              </View>
              <View style={styles.navRow}>
                <TouchableOpacity
                  style={[styles.navBtn, imgIdx === 0 && { opacity: 0.3 }]}
                  onPress={() => setImgIdx(i => Math.max(0, i - 1))}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.navCount}>{imgIdx + 1} / {imgPreview.length}</Text>
                <TouchableOpacity
                  style={[styles.navBtn, imgIdx === imgPreview.length - 1 && { opacity: 0.3 }]}
                  onPress={() => setImgIdx(i => Math.min(imgPreview.length - 1, i + 1))}
                >
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

// ─── Comparison Tab ───────────────────────────────────────────────────────────
export function ComparisonTab({ farm }) {
  const latestGov    = farm.history.find(h => h.type === 'government');
  const latestFarmer = farm.history.find(h => h.type === 'farmer');

  if (!latestGov || !latestFarmer) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="bar-chart-outline" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>Need both farmer and government assessments to compare.</Text>
      </View>
    );
  }

  const govPct    = Math.round((latestGov.totalScore / TOTAL_MAX_SCORE) * 100);
  const farmerPct = Math.round((latestFarmer.totalScore / TOTAL_MAX_SCORE) * 100);
  const diff      = govPct - farmerPct;
  const govRisk   = getRiskLevel(latestGov.totalScore);
  const farmerRisk = getRiskLevel(latestFarmer.totalScore);
  const bigDiff   = Math.abs(diff) >= 15;

  return (
    <View>
      <Text style={styles.sectionTitle}>Farmer vs Government Comparison</Text>

      {/* Summary cards */}
      <View style={styles.compSummaryRow}>
        <View style={[styles.compCard, { borderColor: farmerRisk.color, borderWidth: 2 }]}>
          <Text style={styles.compCardLabel}>Farmer Assessment</Text>
          <Text style={[styles.compCardScore, { color: farmerRisk.color }]}>
            {latestFarmer.totalScore}/{TOTAL_MAX_SCORE}
          </Text>
          <View style={[styles.riskPill, { backgroundColor: farmerRisk.bg }]}>
            <Text style={[styles.riskPillText, { color: farmerRisk.color }]}>{farmerRisk.label}</Text>
          </View>
          <Text style={styles.compCardPct}>{farmerPct}%</Text>
          <Text style={styles.compCardDate}>{latestFarmer.date}</Text>
        </View>

        <View style={styles.diffBox}>
          <Text style={styles.diffLabel}>Diff</Text>
          <Text style={[styles.diffVal, { color: diff < 0 ? Colors.danger : Colors.secondary }]}>
            {diff > 0 ? '+' : ''}{diff}%
          </Text>
        </View>

        <View style={[styles.compCard, { borderColor: govRisk.color, borderWidth: 2 }]}>
          <Text style={styles.compCardLabel}>Government Assessment</Text>
          <Text style={[styles.compCardScore, { color: govRisk.color }]}>
            {latestGov.totalScore}/{TOTAL_MAX_SCORE}
          </Text>
          <View style={[styles.riskPill, { backgroundColor: govRisk.bg }]}>
            <Text style={[styles.riskPillText, { color: govRisk.color }]}>{govRisk.label}</Text>
          </View>
          <Text style={styles.compCardPct}>{govPct}%</Text>
          <Text style={styles.compCardDate}>{latestGov.date}</Text>
        </View>
      </View>

      {bigDiff && (
        <View style={styles.warnBox}>
          <Ionicons name="warning" size={16} color={Colors.warning} />
          <Text style={styles.warnText}>
            Significant assessment variation detected ({Math.abs(diff)}%). Review recommended.
          </Text>
        </View>
      )}

      {/* Bar chart comparison */}
      <Text style={styles.sectionTitle}>Score Comparison by Criterion</Text>
      {BIOSECURITY_CRITERIA.map(c => {
        const fScore = latestFarmer.scores[c.id] ?? 0;
        const gScore = latestGov.scores[c.id] ?? 0;
        const fPct   = (fScore / c.maxScore) * 100;
        const gPct   = (gScore / c.maxScore) * 100;
        const fColor = getRiskLevel(fScore, c.maxScore).color;
        const gColor = getRiskLevel(gScore, c.maxScore).color;
        return (
          <View key={c.id} style={styles.compCriterion}>
            <Text style={styles.compCriterionLabel}>{c.label}</Text>
            <View style={styles.compBarRow}>
              <Text style={styles.compBarTag}>F</Text>
              <View style={styles.compBarWrap}>
                <View style={[styles.compBarFill, { width: `${fPct}%`, backgroundColor: fColor }]} />
              </View>
              <Text style={[styles.compBarScore, { color: fColor }]}>{fScore}/{c.maxScore}</Text>
            </View>
            <View style={styles.compBarRow}>
              <Text style={[styles.compBarTag, { color: PURPLE }]}>G</Text>
              <View style={styles.compBarWrap}>
                <View style={[styles.compBarFill, { width: `${gPct}%`, backgroundColor: gColor }]} />
              </View>
              <Text style={[styles.compBarScore, { color: gColor }]}>{gScore}/{c.maxScore}</Text>
            </View>
          </View>
        );
      })}

      {/* Overall bars */}
      <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Overall Score Comparison</Text>
        <View style={styles.overallBarRow}>
          <Text style={styles.overallBarLabel}>Farmer</Text>
          <View style={styles.overallBarWrap}>
            <View style={[styles.overallBarFill, { width: `${farmerPct}%`, backgroundColor: farmerRisk.color }]} />
          </View>
          <Text style={[styles.overallBarPct, { color: farmerRisk.color }]}>{farmerPct}%</Text>
        </View>
        <View style={styles.overallBarRow}>
          <Text style={styles.overallBarLabel}>Gov</Text>
          <View style={styles.overallBarWrap}>
            <View style={[styles.overallBarFill, { width: `${govPct}%`, backgroundColor: govRisk.color }]} />
          </View>
          <Text style={[styles.overallBarPct, { color: govRisk.color }]}>{govPct}%</Text>
        </View>
        <View style={styles.overallDiffRow}>
          <Text style={styles.overallDiffLabel}>Difference:</Text>
          <Text style={[styles.overallDiffVal, { color: diff < 0 ? Colors.danger : Colors.secondary }]}>
            {diff > 0 ? '+' : ''}{diff}%
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle:       { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  histCard:           { backgroundColor: '#fff', borderRadius: BorderRadius.md, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm },
  histHeader:         { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  histIcon:           { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  histTitleRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  typePill:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  typePillText:       { fontSize: 10, fontWeight: '700' },
  histDate:           { fontSize: FontSize.xs, color: Colors.textSecondary },
  histBy:             { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  histScoreRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  histScore:          { fontSize: FontSize.md, fontWeight: '800' },
  riskPill:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  riskPillText:       { fontSize: 10, fontWeight: '700' },
  histEvidence:       { fontSize: FontSize.xs, color: Colors.textSecondary },
  histDetail:         { borderTopWidth: 1, borderTopColor: Colors.border, padding: Spacing.md },
  detailSectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailLabel:        { fontSize: FontSize.xs, color: Colors.text, width: 130 },
  detailBarWrap:      { flex: 1, height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginHorizontal: 8 },
  detailBarFill:      { height: '100%', borderRadius: 3 },
  detailScore:        { fontSize: FontSize.xs, fontWeight: '700', width: 36, textAlign: 'right' },
  detailRemarks:      { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, backgroundColor: Colors.background, borderRadius: BorderRadius.sm, padding: Spacing.sm },
  actionRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  priorityDot:        { width: 8, height: 8, borderRadius: 4 },
  actionText:         { flex: 1, fontSize: FontSize.xs, color: Colors.text },
  statusPill:         { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  statusPillText:     { fontSize: 10, fontWeight: '700' },
  thumbRow:           { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  thumb:              { width: 80, height: 60, borderRadius: BorderRadius.sm },
  thumbLabel:         { fontSize: 10, color: Colors.textSecondary, marginTop: 2, width: 80, textAlign: 'center' },
  modalBg:            { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalClose:         { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  fullImg:            { width: SW, height: SW * 0.75 },
  modalInfo:          { padding: Spacing.md, alignItems: 'center' },
  modalCat:           { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
  modalDesc:          { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'center' },
  navRow:             { flexDirection: 'row', alignItems: 'center', gap: 32, marginTop: Spacing.md },
  navBtn:             { padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24 },
  navCount:           { fontSize: FontSize.md, color: '#fff', fontWeight: '700' },
  emptyWrap:          { alignItems: 'center', padding: Spacing.xxl },
  emptyText:          { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md },
  compSummaryRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  compCard:           { flex: 1, backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', gap: 6, ...Shadow.sm },
  compCardLabel:      { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  compCardScore:      { fontSize: FontSize.xl, fontWeight: '900' },
  compCardPct:        { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  compCardDate:       { fontSize: 10, color: Colors.textSecondary },
  diffBox:            { alignItems: 'center', paddingHorizontal: Spacing.sm },
  diffLabel:          { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },
  diffVal:            { fontSize: FontSize.lg, fontWeight: '900' },
  warnBox:            { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fff3cd', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  warnText:           { flex: 1, fontSize: FontSize.xs, color: Colors.warning, fontWeight: '600' },
  compCriterion:      { backgroundColor: '#fff', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.xs, ...Shadow.sm },
  compCriterionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  compBarRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  compBarTag:         { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, width: 14 },
  compBarWrap:        { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  compBarFill:        { height: '100%', borderRadius: 3 },
  compBarScore:       { fontSize: 10, fontWeight: '700', width: 32, textAlign: 'right' },
  overallCard:        { backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm, marginTop: Spacing.sm },
  overallTitle:       { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  overallBarRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  overallBarLabel:    { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, width: 44 },
  overallBarWrap:     { flex: 1, height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden' },
  overallBarFill:     { height: '100%', borderRadius: 5 },
  overallBarPct:      { fontSize: FontSize.sm, fontWeight: '800', width: 40, textAlign: 'right' },
  overallDiffRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  overallDiffLabel:   { fontSize: FontSize.sm, color: Colors.textSecondary },
  overallDiffVal:     { fontSize: FontSize.lg, fontWeight: '900' },
});
