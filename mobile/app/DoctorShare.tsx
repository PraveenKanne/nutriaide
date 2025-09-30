// mobile/app/DoctorShare.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { getToken } from '../lib/session';
import { authApi } from '../lib/api';
import { clear } from 'console';

export default function DoctorShare() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [link, setLink] = useState<string | null>(null);

  async function createLink() {
    try {
      const t = await getToken(); if (!t) return;
      const res = await authApi<{ shareUrl: string }>(
        '/doctor/share', t,
        { method: 'POST', body: JSON.stringify({ doctorName: name, doctorContact: contact, scopes: ['nutrition', 'meds', 'vitals'], days: 30 }) }
      );
      setLink(res.shareUrl);
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>Generate a secure report link for your doctor.</Text>
      <TextInput placeholder="Doctor name" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Doctor contact (email/phone)" value={contact} onChangeText={setContact} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Create link" onPress={createLink} />
      {link && (<Text selectable numberOfLines={3}>Share this link: {link}</Text>)}
    </View>
  );
}