import { useState, useCallback } from 'react';
import { API_BASE_URL, authHeaders } from '../services/authService';

export const useMasterData = (endpointContext) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUrl = `${API_BASE_URL}/master/${endpointContext}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(fetchUrl, {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(Array.isArray(result) ? result : (result?.data ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  const createData = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create data');
      await fetchData(); // Refresh data
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${fetchUrl}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to update data');
      await fetchData();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${fetchUrl}/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete data');
      await fetchData();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchData,
    createData,
    updateData,
    deleteData
  };
};