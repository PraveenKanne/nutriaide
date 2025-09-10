// mobile/lib/api.ts
const BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8080';

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) { const t = await res.text(); throw new Error(t || res.statusText); }
  return res.json();
}

export async function authApi<T>(path: string, token: string, opts: RequestInit = {}) {
  return api<T>(path, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } });
}
