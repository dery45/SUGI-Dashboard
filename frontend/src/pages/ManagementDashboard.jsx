import React, { useState } from 'react';
import { useManagementData } from '../hooks/useManagementData';
import KPISection from '../components/management/KPISection';
import AlertsPanel from '../components/management/AlertsPanel';
import ComparativeChart from '../components/management/ComparativeChart';

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
  const [filters, setFilters] = useState({ year: new Date().getFullYear() });
  const [alerts, setAlerts] = useState(null); // local state for dismissal
  const { kpiData, yieldTrend, loading, error, refetch } = useManagementData(filters);

  // Use kpiData.alerts as the source, but allow local dismissal
  const activeAlerts = alerts ?? kpiData?.alerts ?? [];

  const handleMarkDone = (index) => {
    setAlerts(prev => (prev ?? kpiData?.alerts ?? []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Manajemen</h1>
          <p className="text-gray-500 text-sm">Ringkasan analitik & KPI seluruh unit organisasi</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year filter */}
          <select
            value={filters.year}
            onChange={(e) => setFilters(f => ({ ...f, year: parseInt(e.target.value) }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Filter tahun"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button
            onClick={refetch}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            aria-label="Refresh data"
          >
            🔄 Refresh
          </button>

          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm shadow-sm">
            ⬇ Unduh Laporan
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ⚠️ Gagal memuat data: {error}. Menampilkan data demonstrasi.
        </div>
      )}

      {/* KPI Grid */}
      <KPISection data={kpiData} loading={loading} />

      {/* Revenue Summary strip */}
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

      {/* Alerts */}
      <AlertsPanel
        alerts={activeAlerts}
        onMarkDone={handleMarkDone}
        onAssignUM={(alert) => console.log('Assign UM to alert:', alert)}
      />

      {/* Comparative Chart (Recharts) */}
      <ComparativeChart data={yieldTrend} />

      {/* Cycle Status Breakdown */}
      {!loading && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔄 Status Siklus Tanam</h2>
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
