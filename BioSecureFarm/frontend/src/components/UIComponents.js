import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../theme';

// Glass Card
export const Card = ({ children, style, onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} style={[styles.card, style]}>
      {children}
    </Wrapper>
  );
};

// Gradient Button
export const Button = ({ title, onPress, loading, variant = 'primary', icon, style, disabled }) => {
  const colors = {
    primary: [Colors.primary, Colors.primaryDark],
    secondary: [Colors.secondary, Colors.secondaryDark],
    danger: [Colors.danger, '#b02a37'],
    outline: ['transparent', 'transparent']
  };
  return (
    <TouchableOpacity onPress={onPress} disabled={loading || disabled} style={[styles.btnWrapper, style]}>
      <LinearGradient colors={colors[variant]} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : (
          <View style={styles.btnContent}>
            {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 6 }} />}
            <Text style={[styles.btnText, variant === 'outline' && { color: Colors.primary }]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Input Field
export const Input = ({ label, icon, error, style, ...props }) => (
  <View style={[styles.inputWrapper, style]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={[styles.inputContainer, error && { borderColor: Colors.danger }]}>
      {icon && <Ionicons name={icon} size={20} color={Colors.textSecondary} style={styles.inputIcon} />}
      <TextInput style={styles.input} placeholderTextColor={Colors.textLight} {...props} />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Stat Card
export const StatCard = ({ title, value, icon, color, subtitle, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.statCard, Shadow.md]}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

// Risk Badge
export const RiskBadge = ({ level }) => {
  const config = {
    low: { color: Colors.riskLow, label: 'Low Risk' },
    moderate: { color: Colors.riskModerate, label: 'Moderate Risk' },
    high: { color: Colors.riskHigh, label: 'High Risk' },
    critical: { color: '#6f0000', label: 'Critical' }
  };
  const { color, label } = config[level] || config.low;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

// Header
export const Header = ({ title, subtitle, onBack, onMenu, rightIcon, onRightPress }) => (
  <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
    <View style={styles.headerContent}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      {onMenu && (
        <TouchableOpacity onPress={onMenu} style={styles.headerBtn}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      <View style={styles.headerTitle}>
        <Text style={styles.headerTitleText}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {rightIcon && (
        <TouchableOpacity onPress={onRightPress} style={styles.headerBtn}>
          <Ionicons name={rightIcon} size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  </LinearGradient>
);

// Empty State
export const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon || 'folder-open-outline'} size={64} color={Colors.textLight} />
    <Text style={styles.emptyTitle}>{title || 'No data found'}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// Loading Spinner
export const Loader = ({ message }) => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color={Colors.primary} />
    {message && <Text style={styles.loaderText}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.glass, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  btnWrapper: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  btn: { paddingVertical: 14, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  inputWrapper: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.sm },
  inputIcon: { marginRight: Spacing.xs },
  input: { flex: 1, paddingVertical: 12, fontSize: FontSize.md, color: Colors.text },
  errorText: { color: Colors.danger, fontSize: FontSize.xs, marginTop: 4 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', margin: Spacing.xs },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  statTitle: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  statSubtitle: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  header: { paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { padding: Spacing.xs, marginRight: Spacing.xs },
  headerTitle: { flex: 1 },
  headerTitleText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.md },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textLight, textAlign: 'center', marginTop: Spacing.xs },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  loaderText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: FontSize.md }
});
