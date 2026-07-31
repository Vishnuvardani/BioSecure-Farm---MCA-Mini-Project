import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';
import GovDashboard from '../screens/government/GovDashboard';
import OutbreakMonitor from '../screens/government/OutbreakMonitor';
import ComplianceScreen from '../screens/government/ComplianceScreen';
import GISMapScreen from '../screens/shared/GISMapScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AnalyticsScreen from '../screens/shared/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GovTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 10, height: 60, paddingBottom: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ color, size }) => {
        const icons = { Dashboard: 'stats-chart', Outbreaks: 'warning', Compliance: 'shield-checkmark', Map: 'map', Analytics: 'bar-chart' };
        return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
      }
    })}>
      <Tab.Screen name="Dashboard" component={GovDashboard} />
      <Tab.Screen name="Outbreaks" component={OutbreakMonitor} />
      <Tab.Screen name="Compliance" component={ComplianceScreen} />
      <Tab.Screen name="Map" component={GISMapScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export default function GovNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GovTabs" component={GovTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
