const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const fetchFarmerDashboard = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/farmer`, { headers: headers() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch farmer dashboard');
  return json.data;
};

export const fetchGovernmentDashboard = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/government`, { headers: headers() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch government dashboard');
  return json.data;
};
