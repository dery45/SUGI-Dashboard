import { useState, useEffect, useCallback } from 'react';
import { fetchKPIs, fetchYieldTrend } from '../api/managementApi';

export function useManagementData(filters = {}) {
  const [kpiData, setKpiData]       = useState(null);
  const [yieldTrend, setYieldTrend] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, trendRes] = await Promise.all([
        fetchKPIs(token, filters).catch(() => null),
        fetchYieldTrend(token, filters).catch(() => null),
      ]);

      if (kpiRes?.data) setKpiData(kpiRes.data);
      if (trendRes?.data) setYieldTrend(trendRes.data);

      if (!kpiRes?.data) {
        setKpiData({
          activeFarmsCount: 0, activeCyclesCount: 0, totalYieldTons: 0, avgYieldPerHa: 0, costPerKg: 0, avgPricePerKg: 0, totalRevenue: 0, roiPercentage: 0, unassignedUMs: 0, cycleStatusBreakdown: [], alerts: []
        });
      }

      if (!trendRes?.data || trendRes.data.every(d => d.companies === 0)) {
        setYieldTrend([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filters.farm_id, filters.start_date, filters.end_date, filters.year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { kpiData, yieldTrend, loading, error, refetch: fetchData };
}