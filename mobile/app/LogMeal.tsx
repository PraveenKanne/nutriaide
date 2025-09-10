// mobile/app/LogMeal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { getToken } from '../lib/session';
import { authApi } from '../lib/api';

export default function LogMeal({ route, navigation }: any) {
  const { item } = route.params;
  const [servings, setServings] = useState('1');
  const [mealType, setMealType] = useState('Lunch');

  async function save() {
    try {
      const token = await getToken(); if (!token) throw new Error('Not logged in');
      await authApi('/logs/meals', token, {
        method: 'POST',
        body: JSON.stringify({ foodItemId: item.id, servings: Number(servings), mealType, timestamp: new Date().toISOString() })
      });
      Alert.alert('Logged', 'Meal saved'); navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>Logging: {item.name}</Text>
      <Text>Servings</Text>
      <TextInput keyboardType="decimal-pad" value={servings} onChangeText={setServings} style={{ borderWidth: 1, padding: 8 }} />
      <Text>Meal type</Text>
      <TextInput value={mealType} onChangeText={setMealType} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Save" onPress={save} />
    </View>
  );
}
