/**
 * authService.js
 * Single source of truth for authentication + API access on the frontend:
 * token storage, auth headers, base URL, and the auth REST calls.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const authHeaders = (extra = {}) => {
  const token = getToken();
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    ...extra,
  };
};

export async function apiFetch(path, { method = 'GET', body, headers = {}, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: authHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    throw err;
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const err = new Error(json.message || json.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  setToken(json.token);
  return json.user;
}

export async function fetchMe() {
  const json = await apiFetch('/auth/me');
  return json.user;
}

export const logout = () => clearToken();