const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const fetchGovtDashboard = async (filters = {}, signal) => {
  const params = new URLSearchParams();
  if (filters.year && filters.year !== 'all') params.set('year', filters.year);
  if (filters.month && filters.month !== 'all') params.set('month', filters.month);
  if (filters.commodity && filters.commodity !== 'all') params.set('commodity', filters.commodity);
  if (filters.province && filters.province !== 'all') params.set('province', filters.province);
  if (filters.page) params.set('page', filters.page);
  if (filters.limit) params.set('limit', filters.limit);

  const qs = params.toString();
  const url = `${BASE_URL}/dashboard/govt${qs ? '?' + qs : ''}`;

  const res = await fetch(url, { headers: headers(), signal });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal memuat dashboard');
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal memuat dashboard');
  return json.data;
};
