import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';
import VetDashboard from '../screens/veterinarian/VetDashboard';
import InspectionReports from '../screens/veterinarian/InspectionReports';
import DiagnosisScreen from '../screens/veterinarian/DiagnosisScreen';
import OutbreakReporting from '../screens/veterinarian/OutbreakReporting';
import GISMapScreen from '../screens/shared/GISMapScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabOptions = (icons) => ({
  headerShown: false,
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textSecondary,
  tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 10, height: 60, paddingBottom: 8 },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  tabBarIcon: ({ route, color, size }) => <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />
});

function VetTabs() {
  const icons = { Dashboard: 'medical', Reports: 'document-text', Diagnosis: 'flask', Map: 'map', Notifications: 'notifications' };
  return (
    <Tab.Navigator screenOptions={({ route }) => tabOptions(icons)}>
      <Tab.Screen name="Dashboard" component={VetDashboard} />
      <Tab.Screen name="Reports" component={InspectionReports} />
      <Tab.Screen name="Diagnosis" component={DiagnosisScreen} />
      <Tab.Screen name="Map" component={GISMapScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

export function VetNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VetTabs" component={VetTabs} />
      <Stack.Screen name="OutbreakReporting" component={OutbreakReporting} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default VetNavigator;
