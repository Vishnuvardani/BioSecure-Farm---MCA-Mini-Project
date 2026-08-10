import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header, Card } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const MOCK_LOGS = [
  { level: 'info', message: 'User login: farmer@example.com', timestamp: new Date(Date.now() - 60000).toISOString() },
  { level: 'info', message: 'Farm registered: Green Valley Farm', timestamp: new Date(Date.now() - 120000).toISOString() },
  { level: 'warn', message: 'High biosecurity risk detected: Farm #FARM-001', timestamp: new Date(Date.now() - 300000).toISOString() },
  { level: 'error', message: 'Failed vaccination record submission', timestamp: new Date(Date.now() - 600000).toISOString() },
  { level: 'info', message: 'Disease outbreak reported: Bird Flu', timestamp: new Date(Date.now() - 900000).toISOString() },
  { level: 'info', message: 'Biosecurity assessment completed', timestamp: new Date(Date.now() - 1200000).toISOString() },
  { level: 'warn', message: 'Vaccination overdue: 15 animals', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { level: 'info', message: 'GIS location updated for Farm #FARM-005', timestamp: new Date(Date.now() - 2400000).toISOString() },
  { level: 'info', message: 'Government alert issued: District Coimbatore', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { level: 'error', message: 'FCM notification delivery failed', timestamp: new Date(Date.now() - 7200000).toISOString() }
];

const LOG_COLORS = { info: Colors.primary, warn: Colors.warning, error: Colors.danger };
const LOG_ICONS = { info: 'ℹ️', warn: '⚠️', error: '❌' };

export default function SystemLogs({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="System Logs" subtitle="Application activity logs" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}>
        {MOCK_LOGS.map((log, i) => (
          <View key={i} style={[styles.logItem, { borderLeftColor: LOG_COLORS[log.level], borderLeftWidth: 3 }]}>
            <View style={styles.logHeader}>
              <Text style={styles.logIcon}>{LOG_ICONS[log.level]}</Text>
              <View style={[styles.levelBadge, { backgroundColor: LOG_COLORS[log.level] + '20' }]}>
                <Text style={[styles.levelText, { color: LOG_COLORS[log.level] }]}>{log.level.toUpperCase()}</Text>
              </View>
              <Text style={styles.timestamp}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
            </View>
            <Text style={styles.logMessage}>{log.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logItem: { backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.xs },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  logIcon: { fontSize: 14 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  levelText: { fontSize: 10, fontWeight: '700' },
  timestamp: { fontSize: 10, color: Colors.textLight, marginLeft: 'auto' },
  logMessage: { fontSize: FontSize.xs, color: Colors.textSecondary }
});
