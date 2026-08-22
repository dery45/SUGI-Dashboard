import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useManagementData } from './hooks/useManagementData';
import KPISection from './component/KPISection';
import AlertsPanel from './component/AlertsPanel';
import Card from '@/component/common/Card';
import DataTable from '@/component/common/DataTable';
import LoadingSkeleton from '@/component/common/LoadingSkeleton';
import LineChart from '@/component/charts/LineChart';
import BarChart from '@/component/charts/BarChart';
import PieChart from '@/component/charts/PieChart';
import { API_BASE_URL as BASE_URL } from '@/services/authService';

const statusLabels = {
  Planned: 'Direncanakan', Land_Preparation: 'Persiapan Lahan', Planted: 'Ditanam',
  Maintenance: 'Perawatan', Harvesting: 'Panen', Completed: 'Selesai', Failed: 'Gagal',
};
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1', '#6b7280'];

const ManagementDashboard = () => {
  const { token } = useAuth();
  const [farms, setFarms] = useState([]);
  const [filters, setFilters] = useState({ year: new Date().getFullYear(), farm_id: '', start_date: '', end_date: '' });
  const [alerts, setAlerts] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const { kpiData, yieldTrend, loading, error, refetch } = useManagementData(filters);

  useEffect(() => {
    fetch(`${BASE_URL}/master-data/farms/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setFarms(j.data); }).catch(() => {});
  }, [token]);

  // Cost breakdown + recent sales for the new widgets
  useEffect(() => {
    if (!token) return;
    const h = { headers: { Authorization: `Bearer ${token}` } };
    fetch(`${BASE_URL}/expenses?limit=200`, h).then(r => r.json())
      .then(j => { if (j.success) setExpenses(j.data || []); }).catch(() => {});
    fetch(`${BASE_URL}/sales?limit=8`, h).then(r => r.json())
      .then(j => { if (j.success) setRecentSales(j.data || []); }).catch(() => {});
  }, [token]);

  const activeAlerts = alerts ?? kpiData?.alerts ?? [];
  const handleMarkDone = (index) => {
    setAlerts(prev => (prev ?? kpiData?.alerts ?? []).filter((_, i) => i !== index));
  };
  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  // Yield-trend chart data — API shape: {month, companies, groups, independent}
  const trendChartData = useMemo(() => (yieldTrend || []).map(t => ({
    bulan: t.month || t.bulan || '-',
    hasil: Number(t.companies || 0) + Number(t.groups || 0) + Number(t.independent || 0),
  })), [yieldTrend]);

  // Cost-by-category pie data
  const costByCategory = useMemo(() => {
    const map = new Map();
    expenses.forEach(e => {
      const cat = e.category || 'Lainnya';
      map.set(cat, (map.get(cat) || 0) + Number(e.amount || e.total_cost || 0));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Cycle-status distribution pie
  const cycleDist = useMemo(() => (kpiData?.cycleStatusBreakdown || []).map(s => ({
    name: statusLabels[s.status] || s.status,
    value: s.count,
  })), [kpiData]);

  const recentSalesColumns = [
    { header: 'Tanggal', accessor: r => r.sale_date ? new Date(r.sale_date).toLocaleDateString('id-ID') : '-' },
    { header: 'Pembeli', accessor: 'buyer_name' },
    { header: 'Farm', accessor: r => r.farm_id?.name || '-' },
    { header: 'Jumlah (Kg)', accessor: r => Number(r.quantity_kg).toLocaleString('id-ID') },
    { header: 'Total', accessor: r => `Rp ${Number(r.quantity_kg * r.price_per_kg).toLocaleString('id-ID')}` },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Analitik &amp; KPI Dashboard</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Ringkasan analitik &amp; KPI</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full sm:w-auto">
            <select value={filters.farm_id} onChange={e => updateFilter('farm_id', e.target.value)}
              className="text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Semua Farm</option>
              {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
            <input type="date" value={filters.start_date} onChange={e => updateFilter('start_date', e.target.value)}
              className="text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2" />
            <input type="date" value={filters.end_date} onChange={e => updateFilter('end_date', e.target.value)}
              className="text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2" />
            <select value={filters.year} onChange={e => updateFilter('year', parseInt(e.target.value))}
              className="text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={refetch} className="col-span-2 sm:col-auto px-4 py-2 border border-border/40 rounded-xl text-sm font-bold hover:border-primary/50 transition">Refresh</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
          Gagal memuat data: {error}. Menampilkan data demonstrasi.
        </div>
      )}

      <KPISection data={kpiData} loading={loading} />

      {!loading && kpiData?.totalRevenue ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><div className="p-2"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Pendapatan</p><p className="text-2xl font-black text-emerald-600 mt-1">Rp {(kpiData.totalRevenue || 0).toLocaleString('id-ID')}</p></div></Card>
          <Card><div className="p-2"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Harga Jual Rata-rata</p><p className="text-2xl font-black text-blue-600 mt-1">Rp {(kpiData.avgPricePerKg || 0).toLocaleString('id-ID')}/kg</p></div></Card>
          <Card><div className="p-2"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Return on Investment</p><p className="text-2xl font-black text-violet-600 mt-1">{kpiData.roiPercentage}%</p></div></Card>
        </div>
      ) : null}

      <AlertsPanel alerts={activeAlerts} onMarkDone={handleMarkDone} />

      {/* Trend + distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tren Hasil Panen" subtitle="Total hasil per bulan (ton)">
          {loading ? (
            <LoadingSkeleton variant="chart" count={1} />
          ) : trendChartData.length ? (
            <div className="h-[280px]"><LineChart data={trendChartData} xKey="bulan" lineKeys={['hasil']} colors={['#10b981']} /></div>
          ) : <p className="text-muted text-sm italic p-6">Belum ada data tren hasil panen.</p>}
        </Card>

        <Card title="Distribusi Status Siklus Tanam">
          {loading ? (
            <LoadingSkeleton variant="chart" count={1} />
          ) : cycleDist.length ? (
            <div className="h-[280px]"><PieChart data={cycleDist} nameKey="name" dataKey="value" showLegend /></div>
          ) : <p className="text-muted text-sm italic p-6">Belum ada siklus tanam.</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Biaya per Kategori" subtitle="Agregat pengeluaran terbaru">
          {costByCategory.length ? (
            <div className="h-[300px]"><BarChart data={costByCategory} xKey="name" barKeys={['value']} colors={['#f59e0b']} /></div>
          ) : <p className="text-muted text-sm italic p-6">Belum ada data biaya.</p>}
        </Card>

        <Card title="Penjualan Terbaru">
          {recentSales.length ? (
            <DataTable columns={recentSalesColumns} data={[...recentSales].reverse()} itemsPerPage={5} showSearch={false} />
          ) : <p className="text-muted text-sm italic p-6">Belum ada penjualan.</p>}
        </Card>
      </div>
    </div>
  );
};

export default ManagementDashboard;
