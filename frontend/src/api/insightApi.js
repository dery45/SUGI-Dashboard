const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export async function fetchInsights(source) {
  const params = source ? `?source=${encodeURIComponent(source)}` : '';
  const res = await fetch(`${BASE_URL}/insights${params}`, { headers: headers() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || json.error || 'Gagal memuat insight');
  return json.data;
}