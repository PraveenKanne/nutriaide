// mobile/app/FoodDetails.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import { getToken } from '../lib/session';
import { authApi } from '../lib/api';

export default function FoodDetails({ route, navigation }: any) {
  const { item } = route.params;
  const [ideas, setIdeas] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await authApi<{ ideas: any[] }>(`/food/${item.id}/suggestions`, token);
        setIdeas(res.ideas);
      } catch (e) {}
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{item.name}</Text>
      <Text>Ingredients: {item.ingredients?.join(', ') || '-'}</Text>
      <Text>Additives: {item.additives?.join(', ') || '-'}</Text>
      <Text>Allergens: {item.allergens?.join(', ') || '-'}</Text>
      <Text>Per 100g — Energy: {item.nutrients?.energy ?? '-'} kcal, Protein: {item.nutrients?.protein ?? '-'} g, Sugar: {item.nutrients?.sugar ?? '-'} g, Sodium: {item.nutrients?.sodium ?? '-'} mg</Text>
      <Text>Shelf life: unopened {item.shelfLife?.unopened}, opened {item.shelfLife?.opened}</Text>
      <Text style={{ marginTop: 8, fontWeight: '600' }}>Cuisine ideas</Text>
      {ideas.map((i, idx) => <Text key={idx}>• {i.cuisine}: {i.prep} ({i.swap})</Text>)}
      <Button title="Log this" onPress={() => navigation.navigate('LogMeal', { item })} />
    </ScrollView>
  );
}
