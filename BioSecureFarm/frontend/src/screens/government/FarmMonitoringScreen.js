import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { SAMPLE_FARMS, DISTRICTS, TOTAL_MAX_SCORE, getRiskLevel } from './farmMonitoringData';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

const RISK_FILTERS  = ['all', 'low', 'moderate', 'high'];
const STATUS_FILTERS = ['all', 'assessed', 'due', 'overdue'];

const STATUS_CONFIG = {
  assessed:  { label: 'Assessed',  color: '#28A745', bg: '#d4edda' },
  due:       { label: 'Due',       color: '#FFC107', bg: '#fff3cd' },
  overdue:   { label: 'Overdue',   color: '#DC3545', bg: '#f8d7da' },
  scheduled: { label: 'Scheduled', color: '#0D6EFD', bg: '#cfe2ff' },
};

const LIVESTOCK_EMOJI = { pig: '🐷', poultry: '🐔', mixed: '🐷🐔' };

function RiskPill({ score, max = TOTAL_MAX_SCORE }) {
  const { label, color, bg } = getRiskLevel(score, max);
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.pillText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function ScoreBar({ score, max = TOTAL_MAX_SCORE, color }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <View style={styles.scoreBarWrap}>
      <View style={[styles.scoreBarFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function FarmMonitoringScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [search, setSearch]         = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const farms = useMemo(() => {
    let list = SAMPLE_FARMS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.id.toLowerCase().includes(q) ||
        f.farmName.toLowerCase().includes(q) ||
        f.farmerName.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'all') {
      list = list.filter(f => getRiskLevel(f.govAssessmentScore).level === riskFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter(f => f.assessmentStatus === statusFilter);
    }
    if (districtFilter !== 'all') {
      list = list.filter(f => f.district === districtFilter);
    }
    return list;
  }, [search, riskFilter, statusFilter, districtFilter]);

  const stats = useMemo(() => ({
    total:    SAMPLE_FARMS.length,
    low:      SAMPLE_FARMS.filter(f => getRiskLevel(f.govAssessmentScore).level === 'low').length,
    moderate: SAMPLE_FARMS.filter(f => getRiskLevel(f.govAssessmentScore).level === 'moderate').length,
    high:     SAMPLE_FARMS.filter(f => getRiskLevel(f.govAssessmentScore).level === 'high').length,
    due:      SAMPLE_FARMS.filter(f => f.assessmentStatus === 'due').length,
    overdue:  SAMPLE_FARMS.filter(f => f.assessmentStatus === 'overdue').length,
  }), []);

  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  const renderFarm = ({ item }) => {
    const govRisk    = getRiskLevel(item.govAssessmentScore);
    const farmerRisk = getRiskLevel(item.farmerAssessmentScore);
    const govPct     = Math.round((item.govAssessmentScore / TOTAL_MAX_SCORE) * 100);
    const farmerPct  = Math.round((item.farmerAssessmentScore / TOTAL_MAX_SCORE) * 100);

    return (
      <TouchableOpacity
        style={styles.farmCard}
        onPress={() => navigation.navigate('FarmMonitoringDetail', { farmId: item.id })}
        activeOpacity={0.85}
      >
        {/* Card top strip */}
        <View style={[styles.cardStrip, { backgroundColor: govRisk.color }]} />

        <View style={styles.cardBody}>
          {/* Header row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.farmIconWrap}>
              <Text style={styles.farmEmoji}>{LIVESTOCK_EMOJI[item.livestockType] || '🐾'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmName}>{item.farmName}</Text>
              <Text style={styles.farmId}>{item.id} · {item.farmerName}</Text>
              <Text style={styles.farmLoc}>
                <Ionicons name="location-outline" size={11} color={Colors.textSecondary} /> {item.village}, {item.district}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <StatusPill status={item.assessmentStatus} />
              <RiskPill score={item.govAssessmentScore} />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.cardStatsRow}>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatVal}>{item.totalAnimals.toLocaleString()}</Text>
              <Text style={styles.cardStatLabel}>Animals</Text>
            </View>
            <View style={styles.cardStatDivider} />
            <View style={styles.cardStat}>
              <Text style={styles.cardStatVal}>{item.numberOfSheds}</Text>
              <Text style={styles.cardStatLabel}>Sheds</Text>
            </View>
            <View style={styles.cardStatDivider} />
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatVal, { color: govRisk.color }]}>{item.govAssessmentScore}/{TOTAL_MAX_SCORE}</Text>
              <Text style={styles.cardStatLabel}>Gov Score</Text>
            </View>
            <View style={styles.cardStatDivider} />
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatVal, { color: farmerRisk.color }]}>{item.farmerAssessmentScore}/{TOTAL_MAX_SCORE}</Text>
              <Text style={styles.cardStatLabel}>Farmer Score</Text>
            </View>
          </View>

          {/* Score bars */}
          <View style={styles.barsSection}>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Gov</Text>
              <ScoreBar score={item.govAssessmentScore} color={govRisk.color} />
              <Text style={styles.barPct}>{govPct}%</Text>
            </View>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Farmer</Text>
              <ScoreBar score={item.farmerAssessmentScore} color={farmerRisk.color} />
              <Text style={styles.barPct}>{farmerPct}%</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>
              Last: {item.lastAssessmentDate}
            </Text>
            <Text style={[styles.cardFooterText, item.assessmentStatus === 'overdue' && { color: Colors.danger, fontWeight: '700' }]}>
              Next: {item.nextAssessmentDue}
            </Text>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View Details</Text>
              <Ionicons name="chevron-forward" size={12} color="#6f42c1" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6f42c1', '#4a1d96']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.headerTitle}>Farm Monitoring</Text>
            <Text style={styles.headerSub}>{user?.district || 'All Districts'} · {SAMPLE_FARMS.length} farms</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* KPI strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.md }}>
          {[
            { label: 'Total',    value: stats.total,    color: '#fff',     bg: 'rgba(255,255,255,0.2)' },
            { label: 'Low Risk', value: stats.low,      color: '#28A745',  bg: 'rgba(40,167,69,0.25)' },
            { label: 'Moderate', value: stats.moderate, color: '#FFC107',  bg: 'rgba(255,193,7,0.25)' },
            { label: 'High Risk',value: stats.high,     color: '#DC3545',  bg: 'rgba(220,53,69,0.25)' },
            { label: 'Due',      value: stats.due,      color: '#FFC107',  bg: 'rgba(255,193,7,0.25)' },
            { label: 'Overdue',  value: stats.overdue,  color: '#DC3545',  bg: 'rgba(220,53,69,0.25)' },
          ].map(k => (
            <View key={k.label} style={[styles.kpi, { backgroundColor: k.bg }]}>
              <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Farm ID, Farmer, Village, District..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {/* Risk */}
          {RISK_FILTERS.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, riskFilter === r && styles.filterChipActive]}
              onPress={() => setRiskFilter(r)}
            >
              <Text style={[styles.filterChipText, riskFilter === r && styles.filterChipTextActive]}>
                {r === 'all' ? 'All Risk' : r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          {/* Status */}
          {STATUS_FILTERS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
                {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          {/* District */}
          <TouchableOpacity
            style={[styles.filterChip, districtFilter === 'all' && styles.filterChipActive]}
            onPress={() => setDistrictFilter('all')}
          >
            <Text style={[styles.filterChipText, districtFilter === 'all' && styles.filterChipTextActive]}>All Districts</Text>
          </TouchableOpacity>
          {DISTRICTS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.filterChip, districtFilter === d && styles.filterChipActive]}
              onPress={() => setDistrictFilter(d)}
            >
              <Text style={[styles.filterChipText, districtFilter === d && styles.filterChipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{farms.length} farm{farms.length !== 1 ? 's' : ''} found</Text>
      </View>

      <FlatList
        data={farms}
        renderItem={renderFarm}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6f42c1" />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No farms match your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  header:           { paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md },
  headerTop:        { flexDirection: 'row', alignItems: 'center' },
  headerTitle:      { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  headerSub:        { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs },
  kpi:              { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8 },
  kpiVal:           { fontSize: FontSize.xl, fontWeight: '900' },
  kpiLabel:         { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: Spacing.md, marginBottom: Spacing.xs, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, ...Shadow.sm },
  searchInput:      { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  filtersWrap:      { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  filtersRow:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, gap: Spacing.xs },
  filterChip:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
  filterChipText:   { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  filterDivider:    { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  resultsRow:       { paddingHorizontal: Spacing.md, paddingVertical: 6 },
  resultsText:      { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  list:             { padding: Spacing.md, paddingTop: 0, paddingBottom: 80 },
  farmCard:         { backgroundColor: '#fff', borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.md },
  cardStrip:        { height: 4 },
  cardBody:         { padding: Spacing.md },
  cardHeaderRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  farmIconWrap:     { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f0ff', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  farmEmoji:        { fontSize: 24 },
  farmName:         { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  farmId:           { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  farmLoc:          { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  pill:             { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, marginBottom: 3 },
  pillText:         { fontSize: 10, fontWeight: '700' },
  cardStatsRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  cardStat:         { flex: 1, alignItems: 'center' },
  cardStatVal:      { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  cardStatLabel:    { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },
  cardStatDivider:  { width: 1, height: 28, backgroundColor: Colors.border },
  barsSection:      { gap: 6, marginBottom: Spacing.sm },
  barRow:           { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel:         { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, width: 40 },
  scoreBarWrap:     { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill:     { height: '100%', borderRadius: 3 },
  barPct:           { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, width: 32, textAlign: 'right' },
  cardFooter:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  cardFooterText:   { fontSize: FontSize.xs, color: Colors.textSecondary },
  viewBtn:          { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText:      { fontSize: FontSize.xs, fontWeight: '700', color: '#6f42c1' },
  emptyWrap:        { alignItems: 'center', paddingTop: 60 },
  emptyText:        { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.md },
});
