import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { inventoryAPI, farmAPI } from '../../services/api';
import { Card, Header, Button, Input, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const CATEGORIES = ['feed', 'medicine', 'vaccine', 'disinfectant', 'equipment', 'other'];
const UNITS = ['kg', 'g', 'L', 'mL', 'units', 'bags', 'bottles', 'boxes'];
const CAT_ICONS = { feed: 'nutrition', medicine: 'medkit', vaccine: 'medical', disinfectant: 'flask', equipment: 'construct', other: 'cube' };
const CAT_COLORS = { feed: '#fd7e14', medicine: Colors.danger, vaccine: Colors.info, disinfectant: '#6f42c1', equipment: Colors.textSecondary, other: Colors.primary };

export default function InventoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    farm: '', itemName: '', category: 'feed', quantity: '',
    unit: 'kg', purchaseDate: '', expiryDate: '', minimumStock: '', supplier: '', notes: ''
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchData = async () => {
    try {
      const [invRes, farmRes] = await Promise.all([inventoryAPI.getAll(), farmAPI.getAll()]);
      setItems(invRes.data || []);
      setFarms(farmRes.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ farm: '', itemName: '', category: 'feed', quantity: '', unit: 'kg', purchaseDate: '', expiryDate: '', minimumStock: '', supplier: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      farm: item.farm?._id || item.farm || '',
      itemName: item.itemName, category: item.category,
      quantity: String(item.quantity), unit: item.unit,
      purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      minimumStock: String(item.minimumStock || ''),
      supplier: item.supplier || '', notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.farm || !form.itemName || !form.quantity) return Alert.alert('Error', 'Farm, item name and quantity are required');
    setSubmitting(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity), minimumStock: Number(form.minimumStock) || 0 };
      if (editItem) {
        await inventoryAPI.update(editItem._id, payload);
      } else {
        await inventoryAPI.create(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat);
  const lowStockCount = items.filter(i => i.isLowStock).length;
  const expiredCount = items.filter(i => i.isExpired).length;

  const renderItem = ({ item }) => {
    const color = CAT_COLORS[item.category] || Colors.primary;
    const isAlert = item.isLowStock || item.isExpired;
    return (
      <Card style={[styles.card, isAlert && styles.cardAlert]}>
        <View style={styles.cardRow}>
          <View style={[styles.catIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name={CAT_ICONS[item.category] || 'cube'} size={22} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.itemFarm}>{item.farm?.farmName}</Text>
            <View style={styles.tagsRow}>
              <View style={[styles.catBadge, { backgroundColor: color + '18' }]}>
                <Text style={[styles.catBadgeText, { color }]}>{item.category}</Text>
              </View>
              {item.isLowStock && <View style={styles.alertBadge}><Text style={styles.alertBadgeText}>Low Stock</Text></View>}
              {item.isExpired && <View style={[styles.alertBadge, { backgroundColor: Colors.danger + '20' }]}><Text style={[styles.alertBadgeText, { color: Colors.danger }]}>Expired</Text></View>}
            </View>
          </View>
          <View style={styles.qtyBox}>
            <Text style={styles.qtyVal}>{item.quantity}</Text>
            <Text style={styles.qtyUnit}>{item.unit}</Text>
          </View>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {item.expiryDate && (
          <Text style={[styles.expiryText, item.isExpired && { color: Colors.danger }]}>
            Expires: {new Date(item.expiryDate).toLocaleDateString()}
          </Text>
        )}
      </Card>
    );
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header title="Inventory" subtitle={`${items.length} items`} onBack={() => navigation.goBack()} rightIcon="add-circle" onRightPress={openAdd} />

      {(lowStockCount > 0 || expiredCount > 0) && (
        <View style={styles.alertBanner}>
          {lowStockCount > 0 && <Text style={styles.alertBannerText}>⚠️ {lowStockCount} low stock item{lowStockCount > 1 ? 's' : ''}</Text>}
          {expiredCount > 0 && <Text style={[styles.alertBannerText, { color: Colors.danger }]}>🚫 {expiredCount} expired item{expiredCount > 1 ? 's' : ''}</Text>}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ padding: Spacing.sm }}>
        {['all', ...CATEGORIES].map(c => (
          <TouchableOpacity key={c} style={[styles.filterChip, filterCat === c && styles.filterChipActive]} onPress={() => setFilterCat(c)}>
            <Text style={[styles.filterText, filterCat === c && styles.filterTextActive]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="No inventory items" subtitle="Tap + to add items" />}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editItem ? 'Edit Item' : 'Add Inventory Item'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Select Farm *</Text>
              <View style={styles.optionRow}>
                {farms.map(f => (
                  <TouchableOpacity key={f._id} style={[styles.chip, form.farm === f._id && styles.chipActive]} onPress={() => set('farm', f._id)}>
                    <Text style={[styles.chipText, form.farm === f._id && { color: '#fff' }]}>{f.farmName}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label="Item Name *" value={form.itemName} onChangeText={v => set('itemName', v)} placeholder="e.g. Poultry Feed" />

              <Text style={styles.label}>Category *</Text>
              <View style={styles.optionRow}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, form.category === c && styles.chipActive]} onPress={() => set('category', c)}>
                    <Text style={[styles.chipText, form.category === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 2, marginRight: Spacing.xs }}>
                  <Input label="Quantity *" value={form.quantity} onChangeText={v => set('quantity', v)} keyboardType="numeric" placeholder="0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unit</Text>
                  <View style={styles.unitRow}>
                    {UNITS.map(u => (
                      <TouchableOpacity key={u} style={[styles.unitChip, form.unit === u && styles.unitChipActive]} onPress={() => set('unit', u)}>
                        <Text style={[styles.unitText, form.unit === u && { color: '#fff' }]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Input label="Minimum Stock Level" value={form.minimumStock} onChangeText={v => set('minimumStock', v)} keyboardType="numeric" placeholder="Alert when below this" />
              <Input label="Supplier" value={form.supplier} onChangeText={v => set('supplier', v)} placeholder="Supplier name" />
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: Spacing.xs }}>
                  <Input label="Purchase Date" value={form.purchaseDate} onChangeText={v => set('purchaseDate', v)} placeholder="YYYY-MM-DD" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Expiry Date" value={form.expiryDate} onChangeText={v => set('expiryDate', v)} placeholder="YYYY-MM-DD" />
                </View>
              </View>
              <Input label="Notes" value={form.notes} onChangeText={v => set('notes', v)} placeholder="Additional notes" multiline />

              <Button title={editItem ? 'Update Item' : 'Add Item'} onPress={handleSubmit} loading={submitting} icon="checkmark-circle-outline" style={{ marginTop: Spacing.sm }} />
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  alertBanner: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: '#fff8e1', borderBottomWidth: 1, borderBottomColor: Colors.warning + '40' },
  alertBannerText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.warning },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.background, marginRight: Spacing.xs },
  filterChipActive: { backgroundColor: '#fd7e14' },
  filterText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: Spacing.md, paddingBottom: 80 },
  card: { marginBottom: Spacing.xs },
  cardAlert: { borderLeftWidth: 3, borderLeftColor: Colors.warning },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  catIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  itemName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  itemFarm: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 1 },
  tagsRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, backgroundColor: Colors.warning + '20' },
  alertBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.warning },
  qtyBox: { alignItems: 'center', marginRight: Spacing.sm },
  qtyVal: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  qtyUnit: { fontSize: 10, color: Colors.textSecondary },
  editBtn: { padding: Spacing.xs },
  expiryText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.xs },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  row: { flexDirection: 'row' },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  unitChip: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
  unitChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  unitText: { fontSize: 10, fontWeight: '600', color: Colors.text }
});
