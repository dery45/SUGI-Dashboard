/**
 * managementApi.js
 * Central API client for all Management Dashboard endpoints.
 * Throws an Error if the server responds with ok: false.
 */

import { API_BASE_URL, getToken } from '@/services/authService';

const BASE_URL = API_BASE_URL;

async function apiFetch(path, token, options = {}) {
  const authToken = token ?? getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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

export const fetchKPIs = (token, params = {}) => {
  const q = new URLSearchParams();
  if (params.farm_id) q.append('farm_id', params.farm_id);
  if (params.block_id) q.append('block_id', params.block_id);
  if (params.cycle_id) q.append('cycle_id', params.cycle_id);
  if (params.start_date) q.append('start_date', params.start_date);
  if (params.end_date) q.append('end_date', params.end_date);
  const qs = q.toString();
  return apiFetch(`/management/kpi${qs ? '?' + qs : ''}`, token);
};

export const fetchYieldTrend = (token, { year, farm_id, start_date, end_date } = {}) => {
  const q = new URLSearchParams();
  q.append('year', year || new Date().getFullYear());
  if (farm_id) q.append('farm_id', farm_id);
  if (start_date) q.append('start_date', start_date);
  if (end_date) q.append('end_date', end_date);
  return apiFetch(`/management/yield-trend?${q}`, token);
};

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

// ─── Cascading Filter ──────────────────────────────────────────────────────────

export const fetchBlocksByFarm = (token, farmId) => {
  const q = new URLSearchParams();
  if (farmId) q.append('farm_id', farmId);
  return apiFetch(`/management/blocks?${q}`, token);
};

export const fetchCyclesByFarmBlock = (token, farmId, blockId) => {
  const q = new URLSearchParams();
  if (farmId) q.append('farm_id', farmId);
  if (blockId) q.append('block', blockId);
  return apiFetch(`/management/cycles?${q}`, token);
};

// ─── Chart Data ────────────────────────────────────────────────────────────────

export const fetchChartData = (token, params = {}) => {
  const q = new URLSearchParams();
  if (params.farm_id) q.append('farm_id', params.farm_id);
  if (params.block_id) q.append('block_id', params.block_id);
  if (params.cycle_id) q.append('cycle_id', params.cycle_id);
  if (params.start_date) q.append('start_date', params.start_date);
  if (params.end_date) q.append('end_date', params.end_date);
  if (params.year) q.append('year', params.year);
  return apiFetch(`/management/chart-data?${q}`, token);
};