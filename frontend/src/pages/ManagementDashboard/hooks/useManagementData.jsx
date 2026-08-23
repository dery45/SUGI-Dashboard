import { useState, useEffect, useCallback } from 'react';
import { fetchKPIs, fetchYieldTrend, fetchChartData } from '../api/managementApi';
import { getToken } from '../../../services/authService';

export function useManagementData(filters = {}) {
  const [kpiData, setKpiData] = useState(null);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getToken();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, trendRes, chartRes] = await Promise.all([
        fetchKPIs(token, filters).catch(() => null),
        fetchYieldTrend(token, filters).catch(() => null),
        fetchChartData(token, filters).catch(() => null),
      ]);

      if (kpiRes?.data) setKpiData(kpiRes.data);
      if (trendRes?.data) setChartData(prev => ({ ...prev, produksiTrend: trendRes.data }));
      if (chartRes?.data) setChartData(chartRes.data);

      if (!kpiRes?.data) {
        setKpiData({
          activeCyclesCount: 0,
          totalProduksiTons: 0,
          totalPendapatan: 0,
          totalPengeluaran: 0,
          labaBersih: 0,
          produktivitasHa: 0,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filters.farm_id, filters.block_id, filters.cycle_id, filters.start_date, filters.end_date, filters.year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { kpiData, chartData, loading, error, refetch: fetchData };
}