// mobile/app/Scan.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { api } from '../lib/api';

export default function Scan({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [item, setItem] = useState<any>(null);

  useEffect(() => { BarCodeScanner.requestPermissionsAsync().then(({ status }) => setHasPermission(status === 'granted')); }, []);

  async function onScan({ data }: any) {
    setScanned(true);
    try {
      const food = await api<any>(`/food/barcode/${data}`);
      setItem(food);
    } catch (e: any) { Alert.alert('Not found', 'Could not fetch item'); }
  }

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {!scanned ? (
          <BarCodeScanner onBarCodeScanned={onScan} style={{ flex: 1 }} />
        ) : (
          <View style={{ padding: 16 }}>
            {item ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                <Text>Brand: {item.brand || '-'}</Text>
                <Text>Pros: {item.pros?.join(', ') || '-'}</Text>
                <Text>Cons: {item.cons?.join(', ') || '-'}</Text>
                <Button title="View details" onPress={() => navigation.navigate('FoodDetails', { item })} />
              </>
            ) : <Text>No item found</Text>}
            <Button title="Scan again" onPress={() => { setScanned(false); setItem(null); }} />
          </View>
        )}
      </View>
    </View>
  );
}
