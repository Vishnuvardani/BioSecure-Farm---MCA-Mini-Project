import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SAMPLE_FARMS, TOTAL_MAX_SCORE, getRiskLevel } from './farmMonitoringData';
import { OverviewTab, FarmerAssessmentTab, EvidenceTab } from './FarmMonitoringDetail_Parts';
import GovAssessmentTab from './GovAssessmentTab';
import { HistoryTab, ComparisonTab } from './AssessmentTabs';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const PURPLE = '#6f42c1';

const TABS = [
  { key: 'overview',   label: 'Overview',    icon: 'information-circle-outline' },
  { key: 'farmer',     label: 'Farmer Asmt', icon: 'person-outline' },
  { key: 'evidence',   label: 'Evidence',    icon: 'images-outline' },
  { key: 'gov',        label: 'Gov Asmt',    icon: 'shield-checkmark-outline' },
  { key: 'history',    label: 'History',     icon: 'time-outline' },
  { key: 'comparison', label: 'Compare',     icon: 'bar-chart-outline' },
];

const LIVESTOCK_EMOJI = { pig: '🐷', poultry: '🐔', mixed: '🐷🐔' };

export default function FarmMonitoringDetail() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { farmId } = route.params || {};
  const farm       = SAMPLE_FARMS.find(f => f.id === farmId) || SAMPLE_FARMS[0];
  const [activeTab, setActiveTab] = useState('overview');

  const govRisk = getRiskLevel(farm.govAssessmentScore);

  const STATUS_CFG = {
    assessed: { label: 'Assessed',  color: '#28A745', bg: '#d4edda' },
    due:      { label: 'Due',       color: '#FFC107', bg: '#fff3cd' },
    overdue:  { label: 'Overdue',   color: '#DC3545', bg: '#f8d7da' },
  };
  const sc = STATUS_CFG[farm.assessmentStatus] || STATUS_CFG.assessed;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab farm={farm} />;
      case 'farmer':     return <FarmerAssessmentTab farm={farm} />;
      case 'evidence':   return <EvidenceTab farm={farm} />;
      case 'gov':        return <GovAssessmentTab farm={farm} />;
      case 'history':    return <HistoryTab farm={farm} />;
      case 'comparison': return <ComparisonTab farm={farm} />;
      default:           return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6f42c1', '#4a1d96']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{farm.farmName}</Text>
            <Text style={styles.headerSub}>{farm.id} · {farm.district}</Text>
          </View>
          <TouchableOpacity
            style={styles.conductBtn}
            onPress={() => setActiveTab('gov')}
          >
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={styles.conductBtnText}>Assess</Text>
          </TouchableOpacity>
        </View>

        {/* Farm quick info strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoStripItem}>
            <Text style={styles.infoStripEmoji}>{LIVESTOCK_EMOJI[farm.livestockType]}</Text>
            <Text style={styles.infoStripLabel}>{farm.livestockType}</Text>
          </View>
          <View style={styles.infoStripDivider} />
          <View style={styles.infoStripItem}>
            <Text style={styles.infoStripVal}>{farm.totalAnimals.toLocaleString()}</Text>
            <Text style={styles.infoStripLabel}>Animals</Text>
          </View>
          <View style={styles.infoStripDivider} />
          <View style={styles.infoStripItem}>
            <Text style={[styles.infoStripVal, { color: govRisk.color }]}>
              {farm.govAssessmentScore}/{TOTAL_MAX_SCORE}
            </Text>
            <Text style={styles.infoStripLabel}>Gov Score</Text>
          </View>
          <View style={styles.infoStripDivider} />
          <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusPillText, { color: sc.color }]}>{sc.label}</Text>
          </View>
          <View style={[styles.riskPill, { backgroundColor: govRisk.bg }]}>
            <Text style={[styles.riskPillText, { color: govRisk.color }]}>{govRisk.label}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarInner}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Ionicons
                name={t.icon}
                size={14}
                color={activeTab === t.key ? PURPLE : Colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {renderTab()}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  header:           { paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md },
  headerTop:        { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  backBtn:          { padding: 4 },
  headerTitle:      { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
  headerSub:        { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs },
  conductBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full },
  conductBtnText:   { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  infoStrip:        { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  infoStripItem:    { alignItems: 'center' },
  infoStripEmoji:   { fontSize: 18 },
  infoStripVal:     { fontSize: FontSize.sm, fontWeight: '800', color: '#fff' },
  infoStripLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  infoStripDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.3)' },
  statusPill:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusPillText:   { fontSize: 10, fontWeight: '700' },
  riskPill:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  riskPillText:     { fontSize: 10, fontWeight: '700' },
  tabBar:           { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBarInner:      { paddingHorizontal: Spacing.sm },
  tab:              { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:        { borderBottomColor: PURPLE },
  tabText:          { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive:    { color: PURPLE, fontWeight: '800' },
  content:          { flex: 1 },
  contentInner:     { padding: Spacing.md },
});
