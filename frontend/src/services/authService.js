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

/**
 * Safely parse JSON response. Returns { json, parseError }.
 * If parsing fails, parseError contains a user-friendly Indonesian message.
 */
async function safeJsonParse(res) {
  try {
    const json = await res.json();
    return { json, parseError: null };
  } catch {
    return { json: null, parseError: 'Respons server tidak valid (bukan JSON)' };
  }
}

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
    // Network error (backend down, no internet, etc.)
    const networkErr = new Error('Tidak dapat terhubung ke server. Periksa koneksi internet atau hubungi administrator.');
    networkErr.status = 0; // 0 indicates network failure
    networkErr.isNetworkError = true;
    throw networkErr;
  }

  const { json, parseError } = await safeJsonParse(res);
  if (parseError) {
    const parseErr = new Error(parseError);
    parseErr.status = res.status;
    parseErr.isParseError = true;
    throw parseErr;
  }

  if (!res.ok || json.success === false) {
    const err = new Error(json.message || json.error || `Permintaan gagal: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export async function login(email, password) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    // Network error (backend down, no internet, etc.)
    const networkErr = new Error('Tidak dapat terhubung ke server. Periksa koneksi internet atau hubungi administrator.');
    networkErr.status = 0;
    networkErr.isNetworkError = true;
    throw networkErr;
  }

  const { json, parseError } = await safeJsonParse(res);
  if (parseError) {
    const parseErr = new Error('Respons server tidak valid. Silakan coba lagi atau hubungi administrator.');
    parseErr.status = res.status;
    parseErr.isParseError = true;
    throw parseErr;
  }

  if (!json.success) throw new Error(json.message);
  setToken(json.token);
  return json.user;
}

export async function fetchMe() {
  const json = await apiFetch('/auth/me');
  return json.user;
}

export const logout = () => clearToken();