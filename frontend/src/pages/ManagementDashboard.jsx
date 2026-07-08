import React, { useState, useEffect } from 'react';
import { useManagementData } from '../hooks/useManagementData';
import { useAuth } from '../contexts/AuthContext';
import KPISection from '../components/management/KPISection';
import AlertsPanel from '../components/management/AlertsPanel';
import ComparativeChart from '../components/management/ComparativeChart';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const STATUS_COLORS = {
  Planned: 'bg-gray-100 text-gray-700',
  Land_Preparation: 'bg-blue-100 text-blue-700',
  Planted: 'bg-emerald-100 text-emerald-700',
  Maintenance: 'bg-yellow-100 text-yellow-700',
  Harvesting: 'bg-orange-100 text-orange-700',
  Completed: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

const ManagementDashboard = () => {
  const { token } = useAuth();
  const [farms, setFarms] = useState([]);
  const [filters, setFilters] = useState({ year: new Date().getFullYear(), farm_id: '', start_date: '', end_date: '' });
  const [alerts, setAlerts] = useState(null);
  const { kpiData, yieldTrend, loading, error, refetch } = useManagementData(filters);

  useEffect(() => {
    fetch(`${BASE_URL}/master-data/farms/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setFarms(j.data); }).catch(() => {});
  }, [token]);

  const activeAlerts = alerts ?? kpiData?.alerts ?? [];

  const handleMarkDone = (index) => {
    setAlerts(prev => (prev ?? kpiData?.alerts ?? []).filter((_, i) => i !== index));
  };

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Dashboard Manajemen</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Ringkasan analitik & KPI</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full sm:w-auto">
          <select value={filters.farm_id} onChange={e => updateFilter('farm_id', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Semua Farm</option>
            {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>

          <input type="date" value={filters.start_date} onChange={e => updateFilter('start_date', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Dari Tgl" />

          <input type="date" value={filters.end_date} onChange={e => updateFilter('end_date', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Sampai Tgl" />

          <select value={filters.year} onChange={e => updateFilter('year', parseInt(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button onClick={refetch} className="col-span-2 sm:col-auto px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Refresh</button>
        </div>
      </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          Gagal memuat data: {error}. Menampilkan data demonstrasi.
        </div>
      )}

      <KPISection data={kpiData} loading={loading} />

      {!loading && kpiData?.totalRevenue && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-xl shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Pendapatan</p>
            <p className="text-2xl font-black mt-1">Rp {kpiData.totalRevenue.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-xl shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Harga Jual Rata-rata</p>
            <p className="text-2xl font-black mt-1">Rp {kpiData.avgPricePerKg?.toLocaleString('id-ID')}/kg</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-5 rounded-xl shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Return on Investment</p>
            <p className="text-2xl font-black mt-1">{kpiData.roiPercentage}%</p>
          </div>
        </div>
      )}

      <AlertsPanel alerts={activeAlerts} onMarkDone={handleMarkDone} onAssignUM={(alert) => console.log('Assign UM to alert:', alert)} />

      <ComparativeChart data={yieldTrend} />

      {!loading && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Status Siklus Tanam</h2>
          <div className="flex flex-wrap gap-3">
            {(kpiData?.cycleStatusBreakdown ?? []).map((item, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
                <span>{item.status.replace(/_/g, ' ')}</span>
                <span className="bg-white/60 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ManagementDashboard;