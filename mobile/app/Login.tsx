// mobile/app/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { api } from '../lib/api';
import { setToken } from '../lib/session';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');

  async function onRegister() {
    try {
      const res = await api<{ token: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
      await setToken(res.token);
      navigation.replace('Home');
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  async function onLogin() {
    try {
      const res = await api<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      await setToken(res.token);
      navigation.replace('Home');
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Welcome</Text>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 8 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
      <Text>Name (for register)</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Login" onPress={onLogin} />
      <Button title="Register" onPress={onRegister} />
    </View>
  );
}
