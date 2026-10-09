import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BIOSECURITY_CRITERIA, TOTAL_MAX_SCORE, getRiskLevel } from './farmMonitoringData';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const PURPLE = '#6f42c1';
const FREQ_OPTIONS = ['once', 'twice'];
const ASMT_TYPES = ['routine', 'follow_up', 'risk_based'];
const ASMT_TYPE_LABELS = { routine: 'Routine Inspection', follow_up: 'Follow-up Inspection', risk_based: 'Risk-based Inspection' };
const PRIORITY_COLORS = { low: Colors.secondary, medium: Colors.warning, high: Colors.danger };

const CORRECTIVE_ACTIONS_LIST = [
  'Improve farm access control',
  'Maintain proper footbath',
  'Improve cleaning and disinfection',
  'Separate sick animals immediately',
  'Improve quarantine facilities',
  'Improve feed storage',
  'Improve waste disposal',
  'Update vaccination records',
  'Complete visitor log entries',
  'Install pest control measures',
];

function ScoreCircle({ score, max = TOTAL_MAX_SCORE, size = 68 }) {
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
  score: { fontWeight: '900' },
  max:   { color: Colors.textSecondary, marginTop: -2 },
  pct:   { fontWeight: '700', marginTop: 1 },
});

export default function GovAssessmentTab({ farm }) {
  const latestGov = farm.history.find(h => h.type === 'government');
  const latestFarmer = farm.history.find(h => h.type === 'farmer');

  const initScores = {};
  BIOSECURITY_CRITERIA.forEach(c => { initScores[c.id] = latestGov?.scores[c.id] ?? 0; });

  const [scores, setScores] = useState(initScores);
  const [remarks, setRemarks] = useState(latestGov?.remarks || '');
  const [selectedActions, setSelectedActions] = useState(
    latestGov?.correctiveActions?.map(a => a.action) || []
  );
  const [actionPriorities, setActionPriorities] = useState(
    Object.fromEntries((latestGov?.correctiveActions || []).map(a => [a.action, a.priority]))
  );
  const [frequency, setFrequency] = useState(latestGov?.frequency || 'once');
  const [asmtType, setAsmtType] = useState(latestGov?.assessmentType || 'routine');
  const [asmtDate, setAsmtDate] = useState(new Date().toISOString().split('T')[0]);
  const [officerName, setOfficerName] = useState('Officer Priya Sharma');
  const [confirmModal, setConfirmModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const { label: riskLabel, color: riskColor, bg: riskBg } = getRiskLevel(totalScore);

  const setScore = (id, val) => setScores(p => ({ ...p, [id]: val }));

  const toggleAction = (action) => {
    setSelectedActions(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
    if (!actionPriorities[action]) {
      setActionPriorities(p => ({ ...p, [action]: 'medium' }));
    }
  };

  const setPriority = (action, priority) => {
    setActionPriorities(p => ({ ...p, [action]: priority }));
  };

  const handleSubmit = () => {
    setConfirmModal(false);
    setSubmitted(true);
    Alert.alert(
      'Assessment Submitted',
      `Government assessment submitted successfully.\nScore: ${totalScore}/${TOTAL_MAX_SCORE}\nRisk: ${riskLabel}`,
      [{ text: 'OK' }]
    );
  };

  if (submitted) {
    return (
      <View style={styles.submittedWrap}>
        <Ionicons name="checkmark-circle" size={64} color={Colors.secondary} />
        <Text style={styles.submittedTitle}>Assessment Submitted</Text>
        <Text style={styles.submittedSub}>Score: {totalScore}/{TOTAL_MAX_SCORE} · {riskLabel}</Text>
        <TouchableOpacity style={styles.resubmitBtn} onPress={() => setSubmitted(false)}>
          <Text style={styles.resubmitText}>Conduct New Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {/* Scheduling */}
      <View style={styles.schedCard}>
        <Text style={styles.schedTitle}>📅 Assessment Scheduling</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Text style={styles.fieldLabel}>Assessment Date</Text>
            <TextInput
              style={styles.textInput}
              value={asmtDate}
              onChangeText={setAsmtDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Officer Name</Text>
            <TextInput
              style={styles.textInput}
              value={officerName}
              onChangeText={setOfficerName}
              placeholder="Officer name"
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Assessment Frequency</Text>
        <View style={styles.optRow}>
          {FREQ_OPTIONS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.optChip, frequency === f && styles.optChipActive]}
              onPress={() => setFrequency(f)}
            >
              <Text style={[styles.optChipText, frequency === f && { color: '#fff' }]}>
                {f === 'once' ? 'Once per Month' : 'Twice per Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Assessment Type</Text>
        <View style={styles.optRow}>
          {ASMT_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.optChip, asmtType === t && styles.optChipActive]}
              onPress={() => setAsmtType(t)}
            >
              <Text style={[styles.optChipText, asmtType === t && { color: '#fff' }]}>
                {ASMT_TYPE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.nextDueRow}>
          <Ionicons name="calendar-outline" size={14} color={PURPLE} />
          <Text style={styles.nextDueText}>
            Next Assessment Due:{' '}
            <Text style={{ fontWeight: '800', color: PURPLE }}>
              {frequency === 'once' ? '~30 days from ' : '~15 days from '}{asmtDate}
            </Text>
          </Text>
        </View>

        {farm.assessmentStatus === 'overdue' && (
          <View style={styles.overdueWarn}>
            <Ionicons name="warning" size={14} color={Colors.danger} />
            <Text style={styles.overdueText}>Assessment Overdue — Immediate inspection required</Text>
          </View>
        )}
      </View>

      {/* Criteria scoring */}
      <Text style={styles.sectionTitle}>📋 Independent Assessment Criteria</Text>
      {BIOSECURITY_CRITERIA.map(c => {
        const govScore    = scores[c.id] ?? 0;
        const farmerScore = latestFarmer?.scores[c.id] ?? 0;
        const { color }   = getRiskLevel(govScore, c.maxScore);
        return (
          <View key={c.id} style={styles.criterionCard}>
            <Text style={styles.criterionLabel}>{c.label}</Text>
            <Text style={styles.criterionDesc}>{c.description}</Text>

            <View style={styles.compareRow}>
              <View style={styles.compareBox}>
                <Text style={styles.compareBoxLabel}>Farmer Score</Text>
                <Text style={[styles.compareBoxVal, { color: getRiskLevel(farmerScore, c.maxScore).color }]}>
                  {farmerScore}/{c.maxScore}
                </Text>
              </View>
              <Ionicons name="swap-horizontal" size={16} color={Colors.textSecondary} />
              <View style={styles.compareBox}>
                <Text style={styles.compareBoxLabel}>Gov Officer Score</Text>
                <Text style={[styles.compareBoxVal, { color }]}>{govScore}/{c.maxScore}</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Set Score (0 – {c.maxScore})</Text>
            <View style={styles.scoreButtons}>
              {Array.from({ length: c.maxScore + 1 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.scoreBtn, govScore === i && { backgroundColor: color, borderColor: color }]}
                  onPress={() => setScore(c.id, i)}
                >
                  <Text style={[styles.scoreBtnText, govScore === i && { color: '#fff' }]}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.barWrap}>
              <View style={[styles.barFill, { width: `${(govScore / c.maxScore) * 100}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}

      {/* Running total */}
      <View style={[styles.totalCard, { backgroundColor: riskBg, borderColor: riskColor + '60' }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalLabel}>Running Total</Text>
          <Text style={[styles.totalVal, { color: riskColor }]}>{totalScore} / {TOTAL_MAX_SCORE}</Text>
          <Text style={[styles.totalRisk, { color: riskColor }]}>{riskLabel}</Text>
        </View>
        <ScoreCircle score={totalScore} size={72} />
      </View>

      {/* Remarks */}
      <Text style={styles.sectionTitle}>📝 Inspection Remarks</Text>
      <TextInput
        style={styles.remarksInput}
        value={remarks}
        onChangeText={setRemarks}
        placeholder="Enter detailed inspection remarks, observations, and findings..."
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      {/* Corrective Actions */}
      <Text style={styles.sectionTitle}>⚠️ Corrective Actions Required</Text>
      {CORRECTIVE_ACTIONS_LIST.map(action => {
        const selected = selectedActions.includes(action);
        const priority = actionPriorities[action] || 'medium';
        return (
          <View key={action} style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionCheck, selected && styles.actionCheckActive]}
              onPress={() => toggleAction(action)}
            >
              {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
            </TouchableOpacity>
            <Text style={[styles.actionLabel, selected && { color: Colors.text, fontWeight: '600' }]}>
              {action}
            </Text>
            {selected && (
              <View style={styles.priorityRow}>
                {['low', 'medium', 'high'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityChip, priority === p && { backgroundColor: PRIORITY_COLORS[p] }]}
                    onPress={() => setPriority(action, p)}
                  >
                    <Text style={[styles.priorityText, priority === p && { color: '#fff' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Submit buttons */}
      <View style={styles.submitRow}>
        <TouchableOpacity style={styles.draftBtn}>
          <Ionicons name="save-outline" size={16} color={PURPLE} />
          <Text style={styles.draftBtnText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} onPress={() => setConfirmModal(true)}>
          <Ionicons name="shield-checkmark" size={16} color="#fff" />
          <Text style={styles.submitBtnText}>Submit Assessment</Text>
        </TouchableOpacity>
      </View>

      {/* Confirm modal */}
      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Ionicons name="shield-checkmark" size={40} color={PURPLE} style={{ marginBottom: Spacing.sm }} />
            <Text style={styles.confirmTitle}>Submit Government Assessment?</Text>
            <Text style={styles.confirmBody}>
              After submission, this assessment will be added to the farm's official assessment history and the verified risk level will be updated.
            </Text>
            <View style={styles.confirmScoreRow}>
              <Text style={styles.confirmScoreLabel}>Score:</Text>
              <Text style={[styles.confirmScoreVal, { color: riskColor }]}>{totalScore}/{TOTAL_MAX_SCORE}</Text>
              <Text style={[styles.confirmRisk, { color: riskColor, backgroundColor: riskBg }]}>{riskLabel}</Text>
            </View>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmModal(false)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmSubmit} onPress={handleSubmit}>
                <Text style={styles.confirmSubmitText}>Yes, Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  schedCard:        { backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.md },
  schedTitle:       { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  row:              { flexDirection: 'row', marginBottom: Spacing.sm },
  fieldLabel:       { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary, marginBottom: 5, marginTop: Spacing.xs },
  textInput:        { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.sm, padding: 10, fontSize: FontSize.sm, color: Colors.text, backgroundColor: '#fff' },
  optRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.xs },
  optChip:          { paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  optChipActive:    { backgroundColor: PURPLE, borderColor: PURPLE },
  optChipText:      { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  nextDueRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm, backgroundColor: '#f3f0ff', borderRadius: BorderRadius.sm, padding: Spacing.sm },
  nextDueText:      { fontSize: FontSize.xs, color: Colors.text, flex: 1 },
  overdueWarn:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.xs, backgroundColor: '#f8d7da', borderRadius: BorderRadius.sm, padding: Spacing.sm },
  overdueText:      { fontSize: FontSize.xs, color: Colors.danger, fontWeight: '700', flex: 1 },
  sectionTitle:     { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  criterionCard:    { backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.xs, ...Shadow.sm },
  criterionLabel:   { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  criterionDesc:    { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  compareRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  compareBox:       { alignItems: 'center' },
  compareBoxLabel:  { fontSize: 10, color: Colors.textSecondary, marginBottom: 2 },
  compareBoxVal:    { fontSize: FontSize.md, fontWeight: '800' },
  scoreButtons:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  scoreBtn:         { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  scoreBtnText:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  barWrap:          { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  barFill:          { height: '100%', borderRadius: 3 },
  totalCard:        { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm },
  totalLabel:       { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
  totalVal:         { fontSize: FontSize.xxxl, fontWeight: '900' },
  totalRisk:        { fontSize: FontSize.sm, fontWeight: '700', marginTop: 2 },
  remarksInput:     { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, backgroundColor: '#fff', minHeight: 100, marginBottom: Spacing.sm },
  actionRow:        { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#fff', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.xs, ...Shadow.sm, gap: 8 },
  actionCheck:      { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  actionCheckActive:{ backgroundColor: PURPLE, borderColor: PURPLE },
  actionLabel:      { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },
  priorityRow:      { flexDirection: 'row', gap: 4 },
  priorityChip:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  priorityText:     { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  submitRow:        { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  draftBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: PURPLE, backgroundColor: '#fff' },
  draftBtnText:     { fontSize: FontSize.sm, fontWeight: '700', color: PURPLE },
  submitBtn:        { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: BorderRadius.md, backgroundColor: PURPLE },
  submitBtnText:    { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  confirmOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  confirmCard:      { backgroundColor: '#fff', borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', width: '100%' },
  confirmTitle:     { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  confirmBody:      { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.md },
  confirmScoreRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  confirmScoreLabel:{ fontSize: FontSize.sm, color: Colors.textSecondary },
  confirmScoreVal:  { fontSize: FontSize.xl, fontWeight: '900' },
  confirmRisk:      { fontSize: FontSize.xs, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  confirmBtns:      { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  confirmCancel:    { flex: 1, padding: 14, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  confirmCancelText:{ fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  confirmSubmit:    { flex: 2, padding: 14, borderRadius: BorderRadius.md, backgroundColor: PURPLE, alignItems: 'center' },
  confirmSubmitText:{ fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  submittedWrap:    { alignItems: 'center', padding: Spacing.xxl },
  submittedTitle:   { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginTop: Spacing.md },
  submittedSub:     { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  resubmitBtn:      { marginTop: Spacing.lg, padding: 14, borderRadius: BorderRadius.md, backgroundColor: PURPLE },
  resubmitText:     { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
});
