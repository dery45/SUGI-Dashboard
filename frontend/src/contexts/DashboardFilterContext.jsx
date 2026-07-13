import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchFilterOptions } from '../api/filterApi';

const DashboardFilterContext = createContext(null);

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    year: params.get('year') || null,
    month: params.get('month') || 'all',
    commodity: params.get('commodity') || 'all',
    province: params.get('province') || 'all',
  };
}

function updateURLParams(filters) {
  const params = new URLSearchParams();
  if (filters.year && filters.year !== 'all') params.set('year', filters.year);
  if (filters.month && filters.month !== 'all') params.set('month', filters.month);
  if (filters.commodity && filters.commodity !== 'all') params.set('commodity', filters.commodity);
  if (filters.province && filters.province !== 'all') params.set('province', filters.province);
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

export const DashboardFilterProvider = ({ children }) => {
  const urlParams = parseURLParams();
  const [filters, setFilters] = useState({
    year: urlParams.year, month: urlParams.month, commodity: urlParams.commodity, province: urlParams.province
  });
  const [options, setOptions] = useState({
    years: [], months: MONTHS, commodities: [], provinces: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchFilterOptions()
      .then(data => {
        if (cancelled) return;
        const years = data.years?.length ? data.years : ['2024', '2023', '2022', '2021'];
        const commodities = data.commodities?.length ? data.commodities : [];
        const provinces = data.provinces?.length ? data.provinces : [];
        setOptions({ years, months: MONTHS, commodities, provinces });
        setFilters(prev => ({
          ...prev,
          year: prev.year || 'all'
        }));
      })
      .catch(() => {
        if (cancelled) return;
        const fallbackYears = ['2024', '2023', '2022', '2021'];
        setOptions({ years: fallbackYears, months: MONTHS, commodities: [], provinces: [] });
        setFilters(prev => ({ ...prev, year: prev.year || 'all' }));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    updateURLParams(filters);
  }, [filters]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ year: 'all', month: 'all', commodity: 'all', province: 'all' });
  }, [options.years]);

  return (
    <DashboardFilterContext.Provider value={{ filters, setFilter, resetFilters, options, loading }}>
      {children}
    </DashboardFilterContext.Provider>
  );
};

export const useDashboardFilters = () => {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error('useDashboardFilters must be used within DashboardFilterProvider');
  return ctx;
};
