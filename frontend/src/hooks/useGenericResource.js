import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useGenericResource = (endpoint) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If endpoint starts with '/', it's absolute from API_BASE_URL. Otherwise it's appended.
  const fetchUrl = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;

  const fetchData = useCallback(async (queryParams = '') => {
    setLoading(true);
    setError(null);
    try {
      const q = queryParams ? `?${new URLSearchParams(queryParams).toString()}` : '';
      const response = await fetch(`${fetchUrl}${q}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      
      // Support standard arrays or pagination object { data: [], total: x, ... }
      if (result.data) {
        setData(result.data);
        const { data: _, success, ...restMeta } = result;
        setMeta(restMeta);
      } else if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([result]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  const createData = async (payload) => {
    setLoading(true);
    setError(null);
    console.log(`[FE] POST ${fetchUrl} payload:`, payload);
    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errBody = await response.text();
        console.error(`[FE] POST ${fetchUrl} ERROR ${response.status}:`, errBody);
        throw new Error(`Failed to create data: ${errBody}`);
      }
      console.log(`[FE] POST ${fetchUrl} SUCCESS`);
      await fetchData(); // Refresh data
      return { success: true };
    } catch (err) {
      console.error(`[FE] POST ${fetchUrl} CATCH:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (id, payload) => {
    setLoading(true);
    setError(null);
    console.log(`[FE] PUT ${fetchUrl}/${id} payload:`, payload);
    try {
      const response = await fetch(`${fetchUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // some routes use PATCH (e.g. expenses), retry if 404/Method Not Allowed
      if (response.status === 405 || response.status === 404) {
         console.log(`[FE] PUT failed, trying PATCH ${fetchUrl}/${id}`);
         const patchResp = await fetch(`${fetchUrl}/${id}`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
         });
         if (!patchResp.ok) {
           const errBody = await patchResp.text();
           console.error(`[FE] PATCH ${fetchUrl}/${id} ERROR ${patchResp.status}:`, errBody);
           throw new Error(`Failed to update data via PATCH: ${errBody}`);
         }
      } else if (!response.ok) {
        const errBody = await response.text();
        console.error(`[FE] PUT ${fetchUrl}/${id} ERROR ${response.status}:`, errBody);
        throw new Error(`Failed to update data: ${errBody}`);
      }
      
      console.log(`[FE] UPDATE ${fetchUrl}/${id} SUCCESS`);
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error(`[FE] UPDATE ${fetchUrl}/${id} CATCH:`, err);
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
        method: 'DELETE'
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
    meta,
    loading,
    error,
    fetchData,
    createData,
    updateData,
    deleteData
  };
};
