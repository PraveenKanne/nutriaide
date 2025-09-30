// mobile/app/Meds.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import { authApi } from '../lib/api';
import { getToken } from '../lib/session';

export default function Meds() {
  const [meds, setMeds] = useState<any[]>([]);
  const [name, setName] = useState('Metformin');
  const [dose, setDose] = useState('500');
  const [unit, setUnit] = useState('mg');

  async function load() {
    try { const t = await getToken(); if (!t) return;
      const res = await authApi<{ meds: any[] }>('/meds', t); setMeds(res.meds);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try {
      const t = await getToken(); if (!t) return;
      await authApi('/meds', t, { method: 'POST', body: JSON.stringify({ name, dose: Number(dose), unit, route: 'oral', schedule: { times: ['08:00'] }, start: new Date().toISOString() }) });
      await load();
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>Your medications</Text>
      {meds.map(m => <Text key={m.id}>• {m.name} {m.dose}{m.unit} {m.route}</Text>)}
      <Text style={{ marginTop: 12 }}>Add medication</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput value={dose} onChangeText={setDose} keyboardType="numeric" style={{ borderWidth: 1, padding: 8 }} />
      <TextInput value={unit} onChangeText={setUnit} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Add" onPress={add} />
    </ScrollView>
  );
}
