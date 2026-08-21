import { API_BASE_URL, authHeaders } from '../services/authService';

const BASE_URL = API_BASE_URL;

export async function fetchInsights(source) {
  const params = source ? `?source=${encodeURIComponent(source)}` : '';
  const res = await fetch(`${BASE_URL}/insights${params}`, { headers: authHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || json.error || 'Gagal memuat insight');
  return json.data;
}