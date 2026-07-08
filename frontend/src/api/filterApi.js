const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const fetchFilterOptions = async () => {
  const res = await fetch(`${BASE_URL}/filters`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load filter options');
  return res.json();
};
