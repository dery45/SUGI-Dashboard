const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchInsights(source) {
  const params = source ? `?source=${encodeURIComponent(source)}` : '';
  const res = await fetch(`${BASE_URL}/insights${params}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal memuat insight');
  return json.data;
}
