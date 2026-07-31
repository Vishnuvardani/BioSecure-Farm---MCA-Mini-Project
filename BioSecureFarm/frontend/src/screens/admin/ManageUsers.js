import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../../services/api';
import { Header, Card, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const ROLE_EMOJI = { farmer: '👨🌾', veterinarian: '👨⚕️', government_officer: '🏛️', admin: '⚙️' };

export default function ManageUsers({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const params = roleFilter !== 'all' ? { role: roleFilter } : {};
      const res = await userAPI.getAll(params);
      setUsers(res.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const toggleStatus = async (userId, currentStatus) => {
    Alert.alert('Confirm', `${currentStatus ? 'Deactivate' : 'Activate'} this user?`, [
      { text: 'Cancel' },
      {
        text: 'Confirm', onPress: async () => {
          try {
            await userAPI.toggleStatus(userId);
            fetchUsers();
          } catch (err) { Alert.alert('Error', err.message); }
        }
      }
    ]);
  };

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Manage Users" subtitle={`${users.length} users`} onBack={() => navigation.goBack()} />
      <View style={styles.filterRow}>
        {['all', 'farmer', 'veterinarian', 'government_officer', 'admin'].map(r => (
          <TouchableOpacity key={r} style={[styles.chip, roleFilter === r && styles.chipActive]} onPress={() => setRoleFilter(r)}>
            <Text style={[styles.chipText, roleFilter === r && { color: '#fff' }]}>{r === 'all' ? 'All' : r.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={users}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No users found" />}
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.fullName?.charAt(0)?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.fullName}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userRole}>{ROLE_EMOJI[item.role]} {item.role?.replace('_', ' ')}</Text>
              </View>
              <View style={styles.userActions}>
                <View style={[styles.statusDot, { backgroundColor: item.isActive ? Colors.secondary : Colors.danger }]} />
                <TouchableOpacity onPress={() => toggleStatus(item._id, item.isActive)} style={styles.toggleBtn}>
                  <Ionicons name={item.isActive ? 'pause-circle' : 'play-circle'} size={24} color={item.isActive ? Colors.warning : Colors.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', padding: Spacing.sm, gap: Spacing.xs, flexWrap: 'wrap' },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  userCard: { marginBottom: Spacing.xs },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  userName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  userEmail: { fontSize: FontSize.xs, color: Colors.textSecondary },
  userRole: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  userActions: { alignItems: 'center', gap: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  toggleBtn: { padding: 4 }
});
