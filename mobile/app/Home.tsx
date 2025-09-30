// mobile/app/Home.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Home({ navigation }: any) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18 }}>Today at a glance</Text>
      <Button title="Scan food" onPress={() => navigation.navigate('Scan')} />
      <Button title="Medications" onPress={() => navigation.navigate('Meds')} />
      <Button title="Share with doctor" onPress={() => navigation.navigate('DoctorShare')} />
    </View>
  );
}
