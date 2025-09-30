// mobile/lib/session.ts
import * as SecureStore from 'expo-secure-store';
const TOKEN_KEY = 'auth-token';
export async function setToken(t: string) { await SecureStore.setItemAsync(TOKEN_KEY, t); }
export async function getToken() { return SecureStore.getItemAsync(TOKEN_KEY); }
export async function clearToken() { await SecureStore.deleteItemAsync(TOKEN_KEY); }
