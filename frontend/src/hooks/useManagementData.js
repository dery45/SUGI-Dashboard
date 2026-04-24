import { useState, useEffect, useCallback } from 'react';
import { fetchKPIs, fetchYieldTrend } from '../api/managementApi';

/**
 * useManagementData
 * Custom hook for the Management Dashboard.
 * Fetches KPI overview and yield trend in parallel, re-fetches on filter change.
 *
 * @param {object} filters - Current filter state (year, etc.)
 * @returns {{ kpiData, yieldTrend, loading, error, refetch }}
 */
export function useManagementData(filters = {}) {
  const [kpiData, setKpiData]       = useState(null);
  const [yieldTrend, setYieldTrend] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // In a real app, get token from AuthContext / localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, trendRes] = await Promise.all([
        fetchKPIs(token).catch(() => null),
        fetchYieldTrend(token, filters.year).catch(() => null),
      ]);

      if (kpiRes?.data) setKpiData(kpiRes.data);
      if (trendRes?.data) setYieldTrend(trendRes.data);

      // Fallback to mock data if API is unavailable (development / demo)
      if (!kpiRes?.data) {
        setKpiData({
          activeFarmsCount: 24,
          activeCyclesCount: 15,
          totalYieldTons: 187.5,
          avgYieldPerHa: 3.75,
          costPerKg: 2450,
          avgPricePerKg: 3800,
          totalRevenue: 712500000,
          roiPercentage: 34.2,
          unassignedUMs: 2,
          cycleStatusBreakdown: [
            { status: 'Planned', count: 3 },
            { status: 'Land_Preparation', count: 4 },
            { status: 'Planted', count: 2 },
            { status: 'Harvesting', count: 5 },
            { status: 'Completed', count: 1 },
          ],
          alerts: [
            { type: 'Warning', message: 'Masa panen Blok A akan berakhir dalam 3 hari', dueDate: '2026-04-01' },
            { type: 'Info', message: 'Lahan Blok C siap ditutup – analisis tanah selesai', dueDate: '2026-04-05' },
          ],
        });
      }

      if (!trendRes?.data || trendRes.data.every(d => d.companies === 0)) {
        setYieldTrend([
          { month: 'Jan', companies: 400, groups: 240, independent: 200 },
          { month: 'Feb', companies: 300, groups: 139, independent: 221 },
          { month: 'Mar', companies: 200, groups: 980, independent: 229 },
          { month: 'Apr', companies: 278, groups: 390, independent: 200 },
          { month: 'Mei', companies: 189, groups: 480, independent: 218 },
          { month: 'Jun', companies: 239, groups: 380, independent: 250 },
          { month: 'Jul', companies: 310, groups: 420, independent: 195 },
          { month: 'Agu', companies: 360, groups: 310, independent: 230 },
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filters.year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { kpiData, yieldTrend, loading, error, refetch: fetchData };
}
