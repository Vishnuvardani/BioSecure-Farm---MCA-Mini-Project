import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/shared/SplashScreen';
import AuthNavigator from './AuthNavigator';
import FarmerNavigator from './FarmerNavigator';
import VetNavigator from './VetNavigator';
import GovNavigator from './GovNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || loading) return <SplashScreen />;

  const getRoleNavigator = () => {
    if (!user) return <Stack.Screen name="Auth" component={AuthNavigator} />;
    switch (user.role) {
      case 'farmer': return <Stack.Screen name="Farmer" component={FarmerNavigator} />;
      case 'veterinarian': return <Stack.Screen name="Vet" component={VetNavigator} />;
      case 'government_officer': return <Stack.Screen name="Gov" component={GovNavigator} />;
      case 'admin': return <Stack.Screen name="Admin" component={AdminNavigator} />;
      default: return <Stack.Screen name="Auth" component={AuthNavigator} />;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {getRoleNavigator()}
    </Stack.Navigator>
  );
}
