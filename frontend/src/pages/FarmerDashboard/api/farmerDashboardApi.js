import { API_BASE_URL, authHeaders } from '@/services/authService';

const BASE_URL = API_BASE_URL;

export const fetchFarmerDashboard = async (filters = {}, signal) => {
  const p = new URLSearchParams();
  if (filters.year && filters.year !== 'all') p.set('year', filters.year);
  if (filters.month && filters.month !== 'all') p.set('month', filters.month);
  if (filters.commodity && filters.commodity !== 'all') p.set('commodity', filters.commodity);
  if (filters.province && filters.province !== 'all') p.set('province', filters.province);
  if (filters.page) p.set('page', filters.page);
  if (filters.limit) p.set('limit', filters.limit);
  const qs = p.toString();

  const res = await fetch(`${BASE_URL}/dashboard/farmer/v2${qs ? '?' + qs : ''}`, { headers: authHeaders(), signal });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Gagal memuat dashboard'); }
  const j = await res.json();
  if (!j.success) throw new Error(j.message || 'Gagal memuat dashboard');
  return j.data;
};