// mobile/App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/Login';
import Home from './app/Home';
import Scan from './app/Scan';
import FoodDetails from './app/FoodDetails';
import LogMeal from './app/LogMeal';
import Meds from './app/Meds';
import DoctorShare from './app/DoctorShare';
import { getToken } from './lib/session';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');
  useEffect(() => { getToken().then(t => setInitialRoute(t ? 'Home' : 'Login')); }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={Login} options={{ title: 'Sign in' }} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Scan" component={Scan} />
        <Stack.Screen name="FoodDetails" component={FoodDetails} options={{ title: 'Food details' }} />
        <Stack.Screen name="LogMeal" component={LogMeal} options={{ title: 'Log meal' }} />
        <Stack.Screen name="Meds" component={Meds} options={{ title: 'Medications' }} />
        <Stack.Screen name="DoctorShare" component={DoctorShare} options={{ title: 'Share with doctor' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
