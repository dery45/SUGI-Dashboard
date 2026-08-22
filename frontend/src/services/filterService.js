import { API_BASE_URL, authHeaders } from '../services/authService';

const BASE_URL = API_BASE_URL;

export const fetchFilterOptions = async () => {
  const res = await fetch(`${BASE_URL}/filters`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load filter options');
  const json = await res.json();
  return json.data ?? json;
};