/**
 * managementApi.js
 * Central API client for all Management Dashboard endpoints.
 * Throws an Error if the server responds with ok: false.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiFetch(path, token, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || `Request failed: ${res.status}`);
  }
  return json;
}

// ─── KPI & Analytics ──────────────────────────────────────────────────────────

export const fetchKPIs = (token) =>
  apiFetch('/management/kpi', token);

export const fetchYieldTrend = (token, year) =>
  apiFetch(`/management/yield-trend?year=${year || new Date().getFullYear()}`, token);

export const fetchUMPerformance = (token) =>
  apiFetch('/management/um-performance', token);

// ─── Farmers & Users ──────────────────────────────────────────────────────────

export const fetchFarmers = (token, { role, search, page = 1 } = {}) => {
  const params = new URLSearchParams({ page });
  if (role) params.append('role', role);
  if (search) params.append('search', search);
  return apiFetch(`/farmers?${params}`, token);
};

export const createFarmer = (token, data) =>
  apiFetch('/farmers', token, { method: 'POST', body: JSON.stringify(data) });

export const updateFarmer = (token, id, data) =>
  apiFetch(`/farmers/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteFarmer = (token, id) =>
  apiFetch(`/farmers/${id}`, token, { method: 'DELETE' });

// ─── Sales & Distribution ─────────────────────────────────────────────────────

export const fetchSales = (token, { farmId, cycleId, buyerType, page = 1 } = {}) => {
  const params = new URLSearchParams({ page });
  if (farmId) params.append('farm_id', farmId);
  if (cycleId) params.append('cycle_id', cycleId);
  if (buyerType) params.append('buyer_type', buyerType);
  return apiFetch(`/sales?${params}`, token);
};

export const recordSale = (token, data) =>
  apiFetch('/sales', token, { method: 'POST', body: JSON.stringify(data) });

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const fetchExpenses = (token, { farmId, category, page = 1 } = {}) => {
  const params = new URLSearchParams({ page });
  if (farmId) params.append('farm_id', farmId);
  if (category) params.append('category', category);
  return apiFetch(`/expenses?${params}`, token);
};

export const recordExpense = (token, data) =>
  apiFetch('/expenses', token, { method: 'POST', body: JSON.stringify(data) });

export const updateExpense = (token, id, data) =>
  apiFetch(`/expenses/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) });
