import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

import FarmerDashboard from '../screens/farmer/FarmerDashboard';
import FarmListScreen from '../screens/farmer/FarmListScreen';
import AddFarmScreen from '../screens/farmer/AddFarmScreen';
import LivestockScreen from '../screens/farmer/LivestockScreen';
import AddLivestockScreen from '../screens/farmer/AddLivestockScreen';
import VaccinationScreen from '../screens/farmer/VaccinationScreen';
import BiosecurityScreen from '../screens/farmer/BiosecurityScreen';
import DiseasePredictionScreen from '../screens/farmer/DiseasePredictionScreen';
import GISMapScreen from '../screens/shared/GISMapScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ReportsScreen from '../screens/shared/ReportsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import DrawerContent from '../components/DrawerContent';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function FarmerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 10, shadowOpacity: 0.1, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = { Dashboard: 'home', Farms: 'business', Livestock: 'paw', Map: 'map', Notifications: 'notifications' };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={FarmerDashboard} />
      <Tab.Screen name="Farms" component={FarmListScreen} />
      <Tab.Screen name="Livestock" component={LivestockScreen} />
      <Tab.Screen name="Map" component={GISMapScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

function FarmerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FarmerTabs" component={FarmerTabs} />
      <Stack.Screen name="AddFarm" component={AddFarmScreen} />
      <Stack.Screen name="AddLivestock" component={AddLivestockScreen} />
      <Stack.Screen name="Vaccination" component={VaccinationScreen} />
      <Stack.Screen name="Biosecurity" component={BiosecurityScreen} />
      <Stack.Screen name="DiseasePrediction" component={DiseasePredictionScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function FarmerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="FarmerMain" component={FarmerStack} />
    </Drawer.Navigator>
  );
}
