import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gisAPI } from '../../services/api';
import { Header } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../theme';

// Conditional import for maps (web fallback)
let MapView, Marker, Circle, PROVIDER_GOOGLE;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch {
  MapView = null;
}

const MAP_TYPES = [
  { key: 'all', label: 'All', icon: 'layers' },
  { key: 'farm', label: 'Farms', icon: 'business' },
  { key: 'outbreak', label: 'Outbreaks', icon: 'warning' },
  { key: 'hotspot', label: 'Hotspots', icon: 'flame' }
];

export default function GISMapScreen({ navigation }) {
  const [locations, setLocations] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchLocations();
    gisAPI.getHeatmap().then(r => setHeatmap(r.data || [])).catch(() => {});
  }, [filter]);

  const fetchLocations = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const res = await gisAPI.getAll(params);
      setLocations(res.data || []);
    } catch { }
  };

  const getMarkerColor = (loc) => {
    if (loc.locationType === 'outbreak') return Colors.danger;
    if (loc.locationType === 'hotspot') return Colors.warning;
    if (loc.riskLevel === 'high') return Colors.danger;
    if (loc.riskLevel === 'moderate') return Colors.warning;
    return Colors.secondary;
  };

  const getMarkerEmoji = (loc) => {
    if (loc.locationType === 'farm') return '🏠';
    if (loc.locationType === 'outbreak') return '⚠️';
    if (loc.locationType === 'hotspot') return '🔥';
    return '📍';
  };

  if (!MapView) {
    return (
      <View style={styles.container}>
        <Header title="GIS Map" onBack={() => navigation.goBack()} />
        <View style={styles.webFallback}>
          <Text style={styles.webIcon}>🗺️</Text>
          <Text style={styles.webTitle}>GIS Map View</Text>
          <Text style={styles.webSubtitle}>Map requires native device. {locations.length} locations loaded.</Text>
          {locations.map(loc => (
            <View key={loc._id} style={styles.locItem}>
              <Text style={styles.locEmoji}>{getMarkerEmoji(loc)}</Text>
              <View>
                <Text style={styles.locName}>{loc.name}</Text>
                <Text style={styles.locCoords}>{loc.location?.coordinates?.join(', ')}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="GIS Farm Map" subtitle="Live disease & farm tracking" onBack={() => navigation.goBack()} />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {MAP_TYPES.map(t => (
          <TouchableOpacity key={t.key} style={[styles.filterBtn, filter === t.key && styles.filterBtnActive]} onPress={() => setFilter(t.key)}>
            <Ionicons name={t.icon} size={14} color={filter === t.key ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.filterText, filter === t.key && { color: '#fff' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ latitude: 20.5937, longitude: 78.9629, latitudeDelta: 10, longitudeDelta: 10 }}
        showsUserLocation
        showsMyLocationButton
      >
        {locations.map(loc => {
          const [lng, lat] = loc.location?.coordinates || [0, 0];
          if (!lat || !lng) return null;
          return (
            <React.Fragment key={loc._id}>
              <Marker
                coordinate={{ latitude: lat, longitude: lng }}
                title={loc.name}
                description={`${loc.locationType} • ${loc.riskLevel} risk`}
                onPress={() => setSelected(loc)}
              >
                <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(loc) }]}>
                  <Text style={styles.markerEmoji}>{getMarkerEmoji(loc)}</Text>
                </View>
              </Marker>
              {loc.locationType === 'outbreak' && (
                <Circle
                  center={{ latitude: lat, longitude: lng }}
                  radius={loc.radius || 5000}
                  fillColor={Colors.danger + '20'}
                  strokeColor={Colors.danger}
                  strokeWidth={1}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{locations.filter(l => l.locationType === 'farm').length}</Text>
          <Text style={styles.statLabel}>Farms</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.danger }]}>{locations.filter(l => l.locationType === 'outbreak').length}</Text>
          <Text style={styles.statLabel}>Outbreaks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.warning }]}>{heatmap.length}</Text>
          <Text style={styles.statLabel}>Hotspots</Text>
        </View>
      </View>

      {/* Selected Location Info */}
      {selected && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>{selected.name}</Text>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.infoType}>{selected.locationType?.toUpperCase()} • {selected.riskLevel?.toUpperCase()} RISK</Text>
          {selected.farm && <Text style={styles.infoDetail}>Farm: {selected.farm.farmName} | Score: {selected.farm.biosecurityScore}</Text>}
          {selected.disease && <Text style={styles.infoDetail}>Disease: {selected.disease.diseaseName} | {selected.disease.severity}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1 },
  filterBar: { flexDirection: 'row', padding: Spacing.sm, backgroundColor: '#fff', gap: Spacing.xs, ...Shadow.sm },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.background, gap: 4 },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  markerContainer: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  markerEmoji: { fontSize: 16 },
  statsBar: { flexDirection: 'row', backgroundColor: '#fff', padding: Spacing.sm, ...Shadow.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  infoCard: { position: 'absolute', bottom: 20, left: Spacing.md, right: Spacing.md, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadow.lg },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  infoType: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  infoDetail: { fontSize: FontSize.xs, color: Colors.text, marginTop: 4 },
  webFallback: { flex: 1, padding: Spacing.md },
  webIcon: { fontSize: 64, textAlign: 'center', marginBottom: Spacing.md },
  webTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  webSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  locItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, backgroundColor: '#fff', borderRadius: BorderRadius.md, marginBottom: Spacing.xs, gap: Spacing.sm },
  locEmoji: { fontSize: 24 },
  locName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  locCoords: { fontSize: FontSize.xs, color: Colors.textSecondary }
});
