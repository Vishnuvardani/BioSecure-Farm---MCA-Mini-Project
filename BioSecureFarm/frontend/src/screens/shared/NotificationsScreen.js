import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationAPI } from '../../services/api';
import { Header, EmptyState, Loader } from '../../components/UIComponents';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const TYPE_CONFIG = {
  alert: { icon: 'warning', color: Colors.danger },
  vaccination: { icon: 'medical', color: Colors.secondary },
  disease: { icon: 'bug', color: Colors.danger },
  inspection: { icon: 'clipboard', color: Colors.info },
  system: { icon: 'settings', color: Colors.textSecondary },
  report: { icon: 'document-text', color: Colors.primary }
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data || []);
    } catch { }
    setLoading(false);
    setRefreshing(false);
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markRead();
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    } catch { }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const renderItem = ({ item }) => {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
    return (
      <View style={[styles.notifItem, !item.isRead && styles.notifUnread]}>
        <View style={[styles.notifIcon, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]}>{item.title}</Text>
          <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    );
  };

  if (loading) return <Loader />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        onBack={() => navigation.goBack()}
        rightIcon={unreadCount > 0 ? 'checkmark-done' : undefined}
        onRightPress={markAllRead}
      />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="No notifications" subtitle="You're all caught up!" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md, paddingBottom: 80 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.xs },
  notifUnread: { backgroundColor: Colors.primaryLight },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: FontSize.sm, color: Colors.text },
  notifTitleBold: { fontWeight: '800' },
  notifMsg: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  notifTime: { fontSize: 10, color: Colors.textLight, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4 }
});
