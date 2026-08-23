import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useManagementData } from './hooks/useManagementData';
import {
  KpiCard, ChartCard, DashboardSection, ResponsiveGrid,
  ChartContainer, TableContainer, LoadingSkeleton,
  EmptyState
} from '@/component/dashboard';
import Card from '@/component/common/Card';
import LineChart from '@/component/charts/LineChart';
import BarChart from '@/component/charts/BarChart';
import PieChart from '@/component/charts/PieChart';
import CycleTimeline from './component/CycleTimeline';
import { fetchBlocksByFarm, fetchCyclesByFarmBlock } from './api/managementApi';
import { getToken, API_BASE_URL } from '@/services/authService';

const statusLabels = {
  Planned: 'Direncanakan', Land_Preparation: 'Persiapan Lahan', Planted: 'Ditanam',
  Maintenance: 'Perawatan', Harvesting: 'Panen', Completed: 'Selesai', Failed: 'Gagal',
};

const formatRupiah = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

const KPI_CONFIG = [
  { key: 'activeCyclesCount', label: 'Siklus Aktif', unit: '', icon: '🔄', gradient: 'from-green-500/20 to-green-500/5 border-green-500/20', iconColor: 'text-green-400', tooltip: 'Jumlah siklus tanam yang sedang berjalan (belum Selesai/Gagal)' },
  { key: 'totalProduksiTons', label: 'Total Produksi', unit: ' ton', icon: '📦', gradient: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20', iconColor: 'text-emerald-400', tooltip: 'Total hasil panen aktual dari harvestperiods (kg → ton)', fmt: (v) => Number(v).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  { key: 'totalPendapatan', label: 'Total Pendapatan', unit: '', icon: '💰', gradient: 'from-blue-500/20 to-blue-500/5 border-blue-500/20', iconColor: 'text-blue-400', tooltip: 'Total pendapatan dari penjualan', fmt: (v) => `Rp ${Number(v).toLocaleString('id-ID')}` },
  { key: 'labaBersih', label: 'Laba Bersih', unit: '', icon: '📈', gradient: 'from-violet-500/20 to-violet-500/5 border-violet-500/20', iconColor: 'text-violet-400', tooltip: 'Pendapatan dikurangi pengeluaran', fmt: (v) => `Rp ${Number(v).toLocaleString('id-ID')}` },
];

const EMPTY_MSG = {
  statusDist: { title: 'Belum ada data status siklus', desc: 'Tidak ada siklus tanam yang cocok dengan filter saat ini.' },
  produksiTrend: { title: 'Belum ada data tren produksi', desc: 'Data hasil panen per bulan dari harvestperiods belum tersedia untuk filter saat ini.' },
  revExpTrend: { title: 'Belum ada data pendapatan vs pengeluaran', desc: 'Data penjualan dan biaya per bulan belum tersedia untuk filter saat ini.' },
  produksiPerCycle: { title: 'Belum ada data produksi per siklus', desc: 'Data hasil panen per siklus tanam dari harvestperiods belum tersedia.' },
  timeline: { title: 'Belum ada data timeline', desc: 'Data tahapan siklus tanam (Persiapan Lahan, Penanaman, Perawatan, Panen) belum tersedia.' },
  activeCycles: { title: 'Belum ada siklus aktif', desc: 'Tidak ada siklus tanam dengan status Planned hingga Harvesting untuk filter saat ini.' },
  farmBlockPerf: { title: 'Belum ada data performa', desc: 'Data agregat performa per farm/block belum tersedia untuk filter saat ini.' },
};

const TABLE_EMPTY = {
  activeCycles: { title: 'Belum ada siklus aktif', desc: 'Tidak ada siklus tanam dengan status Planned hingga Harvesting untuk filter saat ini.' },
  farmBlockPerf: { title: 'Belum ada data performa farm/block', desc: 'Data agregat performa per farm/block belum tersedia untuk filter saat ini.' },
};

const ManagementDashboard = () => {
  const { token, user } = useAuth();
  const isOwner = user?.role === 'farmer_owner';
  const [farms, setFarms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    farm_id: '',
    block_id: '',
    cycle_id: '',
    start_date: '',
    end_date: '',
  });
  const [loadingFilters, setLoadingFilters] = useState({ blocks: false, cycles: false });

  const { kpiData, chartData, loading, error, refetch } = useManagementData(filters);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/master-data/farms/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setFarms(j.data); }).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!filters.farm_id) { setBlocks([]); setCycles([]); setFilters(f => ({ ...f, block_id: '', cycle_id: '' })); return; }
    setLoadingFilters(prev => ({ ...prev, blocks: true }));
    fetchBlocksByFarm(token, filters.farm_id)
      .then(res => { if (res.success) setBlocks(res.data); })
      .catch(() => {})
      .finally(() => setLoadingFilters(prev => ({ ...prev, blocks: false })));
    setFilters(f => ({ ...f, block_id: '', cycle_id: '' }));
  }, [filters.farm_id, token]);

  useEffect(() => {
    if (!filters.farm_id || !filters.block_id) { setCycles([]); setFilters(f => ({ ...f, cycle_id: '' })); return; }
    setLoadingFilters(prev => ({ ...prev, cycles: true }));
    fetchCyclesByFarmBlock(token, filters.farm_id, filters.block_id)
      .then(res => { if (res.success) setCycles(res.data); })
      .catch(() => {})
      .finally(() => setLoadingFilters(prev => ({ ...prev, cycles: false })));
    setFilters(f => ({ ...f, cycle_id: '' }));
  }, [filters.block_id, token]);

  const updateFilter = useCallback((key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  }, []);

  const handleFarmChange = useCallback((e) => {
    updateFilter('farm_id', e.target.value);
  }, [updateFilter]);

  const handleBlockChange = useCallback((e) => {
    updateFilter('block_id', e.target.value);
  }, [updateFilter]);

  const handleCycleChange = useCallback((e) => {
    updateFilter('cycle_id', e.target.value);
  }, [updateFilter]);

  const statusDist = useMemo(() => (chartData?.statusDistribution || []).map(s => ({
    name: statusLabels[s.status] || s.status,
    value: s.count,
  })), [chartData]);

  const produksiTrend = useMemo(() => (chartData?.produksiTrend || []).map(t => ({
    bulan: t.bulan,
    hasil: Number(t.hasil_ton || 0),
  })), [chartData]);

  const revExpTrend = useMemo(() => (chartData?.revExpTrend || []).map(t => ({
    bulan: t.bulan,
    pendapatan: Number(t.pendapatan || 0),
    pengeluaran: Number(t.pengeluaran || 0),
  })), [chartData]);

  // Series is always padded to 12 months with zeros; treat an all-zero series as "no data"
  const hasRevExpData = useMemo(() => revExpTrend.some(t => t.pendapatan > 0 || t.pengeluaran > 0), [revExpTrend]);

  const produksiPerCycle = useMemo(() => (chartData?.produksiPerCycle || []).map(c => ({
    siklus: c.cycle || c.siklus || '-',
    produksi: Number(c.produksi_ton || 0),
  })), [chartData]);

  const timelineData = useMemo(() => chartData?.timeline || [], [chartData]);

  const activeCyclesColumns = [
    { header: 'Siklus', accessor: 'cycle' },
    { header: 'Komoditas', accessor: 'crop_type' },
    { header: 'Varietas', accessor: 'variety' },
    { header: 'Status', accessor: r => statusLabels[r.status] || r.status },
    { header: 'Luas (Ha)', accessor: r => Number(r.area_ha || 0).toFixed(2) },
    { header: 'Tgl Tanam', accessor: r => r.planting_date ? new Date(r.planting_date).toLocaleDateString('id-ID') : '-' },
    { header: 'Est. Panen', accessor: r => r.expected_end ? new Date(r.expected_end).toLocaleDateString('id-ID') : 'Belum dijadwalkan' },
    { header: 'Produksi (Kg)', accessor: r => Number(r.actual_yield_kg || 0).toLocaleString('id-ID') },
  ];

  const farmBlockPerfColumns = [
    { header: 'Farm', accessor: 'farm_name' },
    { header: 'Block', accessor: 'block_name' },
    { header: 'Siklus Aktif', accessor: 'active_cycles' },
    { header: 'Produksi (Ton)', accessor: r => Number(r.produksi_ton || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { header: 'Pendapatan', accessor: r => `Rp ${Number(r.pendapatan || 0).toLocaleString('id-ID')}` },
    { header: 'Pengeluaran', accessor: r => `Rp ${Number(r.pengeluaran || 0).toLocaleString('id-ID')}` },
    { header: 'Laba', accessor: r => `Rp ${Number(r.laba || 0).toLocaleString('id-ID')}` },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {/* Header with cascading filters */}
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Analitik & KPI Dashboard</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Analitik Berbasis Siklus Tanam</p>
            </div>
          </div>
        </div>

        {/* Cascading Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Farm</label>
            <select value={filters.farm_id} onChange={handleFarmChange}
              className="w-full text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">{isOwner ? 'Semua Farm Saya' : 'Semua Farm'}</option>
              {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>

          <div className="sm:col-span-1 lg:col-span-2">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Block</label>
            <select value={filters.block_id} onChange={handleBlockChange} disabled={!filters.farm_id || loadingFilters.blocks}
              className="w-full text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">Semua Block</option>
              {loadingFilters.blocks ? <option value="" disabled>Memuat...</option> : blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
            </select>
          </div>

          <div className="sm:col-span-1 lg:col-span-2 xl:col-span-2">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Siklus Tanam</label>
            <select value={filters.cycle_id} onChange={handleCycleChange} disabled={!filters.block_id || loadingFilters.cycles}
              className="w-full text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">Semua Siklus</option>
              {loadingFilters.cycles ? <option value="" disabled>Memuat...</option> : cycles.map(c => <option key={c._id} value={c._id}>{c.cycle} — {c.crop_type} {c.variety ? `(${c.variety})` : ''} [{statusLabels[c.status] || c.status}]</option>)}
            </select>
          </div>

          <div className="sm:col-span-1 lg:col-span-2">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Tahun</label>
            <select value={filters.year} onChange={e => updateFilter('year', parseInt(e.target.value))}
              className="w-full text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
              {[2022, 2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Tanggal Mulai</label>
            <input type="date" value={filters.start_date} onChange={e => updateFilter('start_date', e.target.value)}
              className="w-full text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2" />
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Tanggal Akhir</label>
            <input type="date" value={filters.end_date} onChange={e => updateFilter('end_date', e.target.value)}
              className="w-full text-sm bg-background/50 border border-border/50 rounded-xl px-3 py-2" />
          </div>

          <div className="flex items-end sm:col-span-1 lg:col-span-2 xl:col-span-1">
            <button onClick={refetch} disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-border/40 rounded-xl text-sm font-bold hover:border-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
          Gagal memuat data: {error}
        </div>
      )}

      {/* ─── KPI Cards (4 cards) ─── */}
      <DashboardSection title="Ringkasan KPI" subtitle="4 Indikator Utama" accent="from-emerald-400 to-emerald-600">
        <ResponsiveGrid cols={4}>
          {KPI_CONFIG.map(cfg => {
            const kpi = kpiData?.[cfg.key] ?? 0;
            return (
              <KpiCard
                key={cfg.key}
                label={cfg.label}
                value={cfg.fmt ? cfg.fmt(kpi) : `${kpi}${cfg.unit}`}
                tooltip={cfg.tooltip}
                icon={null}
                gradient={cfg.gradient}
                iconColor={cfg.iconColor}
              />
            );
          })}
        </ResponsiveGrid>
      </DashboardSection>

      {/* ─── Charts Row 1: Status Distribution + Produksi Trend ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Distribusi Status Siklus Tanam" subtitle="Donut Chart" accent="from-emerald-400 to-emerald-600">
          <ChartContainer loading={loading} isEmpty={!statusDist.length} emptyTitle={EMPTY_MSG.statusDist.title} emptyDesc={EMPTY_MSG.statusDist.desc}>
            <ChartCard title="Status Siklus Tanam" color="#10b981">
              <div className="h-[280px] flex items-center justify-center">
                {statusDist.length ? (
                  <PieChart data={statusDist} nameKey="name" dataKey="value" showLegend colors={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6b7280']} />
                ) : null}
              </div>
            </ChartCard>
          </ChartContainer>
        </DashboardSection>

        <DashboardSection title="Tren Produksi Bulanan" subtitle="Hasil Panen per Bulan (Ton)" accent="from-blue-400 to-blue-600">
          <ChartContainer loading={loading} isEmpty={!produksiTrend.length} emptyTitle={EMPTY_MSG.produksiTrend.title} emptyDesc={EMPTY_MSG.produksiTrend.desc}>
            <ChartCard title="Tren Produksi" color="#3b82f6">
              <div className="h-[280px]">
                {produksiTrend.length ? (
                  <LineChart data={produksiTrend} xKey="bulan" lineKeys={['hasil']} colors={['#10b981']} />
                ) : null}
              </div>
            </ChartCard>
          </ChartContainer>
        </DashboardSection>
      </div>

      {/* ─── Charts Row 2: Revenue vs Expense + Produksi per Siklus ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Pendapatan vs Pengeluaran Bulanan" subtitle="Tren Bulanan (Rp)" accent="from-violet-400 to-violet-600">
          <ChartContainer loading={loading} isEmpty={!revExpTrend.length || !hasRevExpData} emptyTitle={EMPTY_MSG.revExpTrend.title} emptyDesc={EMPTY_MSG.revExpTrend.desc}>
            <ChartCard title="Pendapatan vs Pengeluaran" color="#8b5cf6">
              <div className="h-[280px]">
                {revExpTrend.length && hasRevExpData ? (
                  <BarChart data={revExpTrend} xKey="bulan" barKeys={['pendapatan', 'pengeluaran']} colors={['#10b981', '#ef4444']} valueFormatter={formatRupiah} />
                ) : null}
              </div>
            </ChartCard>
          </ChartContainer>
        </DashboardSection>

        <DashboardSection title="Produksi per Siklus Tanam" subtitle="Hasil Panen per Siklus (Ton)" accent="from-sky-400 to-sky-600">
          <ChartContainer loading={loading} isEmpty={!produksiPerCycle.length} emptyTitle={EMPTY_MSG.produksiPerCycle.title} emptyDesc={EMPTY_MSG.produksiPerCycle.desc}>
            <ChartCard title="Produksi per Siklus" color="#0ea5e9">
              <div className="h-[280px]">
                {produksiPerCycle.length ? (
                  <BarChart data={produksiPerCycle} xKey="siklus" barKeys={['produksi']} colors={['#0ea5e9']} />
                ) : null}
              </div>
            </ChartCard>
          </ChartContainer>
        </DashboardSection>
      </div>

      {/* ─── Chart Row 3: Cycle Timeline (Gantt) ─── */}
      <DashboardSection title="Timeline Siklus Tanam" subtitle="Gantt Chart: Persiapan Lahan → Penanaman → Perawatan → Panen" accent="from-amber-400 to-amber-600">
        <ChartContainer loading={loading} isEmpty={!timelineData.length} emptyTitle={EMPTY_MSG.timeline.title} emptyDesc={EMPTY_MSG.timeline.desc}>
          <div className="bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30 shadow-lg">
            {timelineData.length ? (
              <CycleTimeline data={timelineData} />
            ) : null}
          </div>
        </ChartContainer>
      </DashboardSection>

      {/* ─── Tables Stacked Vertically ─── */}
      <div className="flex flex-col gap-8">
        {/* Tabel Siklus Tanam Aktif */}
        <DashboardSection title="Siklus Tanam Aktif" subtitle="Semua Siklus dengan Status Planned–Harvesting" accent="from-indigo-400 to-indigo-600">
          <TableContainer
            loading={loading}
            isEmpty={!(chartData?.activeCyclesTable?.length)}
            emptyTitle={TABLE_EMPTY.activeCycles.title}
            emptyDesc={TABLE_EMPTY.activeCycles.desc}
            columns={activeCyclesColumns}
            data={chartData?.activeCyclesTable || []}
            itemsPerPage={10}
          />
        </DashboardSection>

        {/* Performa Farm/Block */}
        <DashboardSection title="Performa Farm / Block" subtitle="Agregat Produksi, Pendapatan, Biaya, Laba per Farm & Block" accent="from-rose-400 to-rose-600">
          <TableContainer
            loading={loading}
            isEmpty={!(chartData?.farmBlockPerformance?.length)}
            emptyTitle={TABLE_EMPTY.farmBlockPerf.title}
            emptyDesc={TABLE_EMPTY.farmBlockPerf.desc}
            columns={farmBlockPerfColumns}
            data={chartData?.farmBlockPerformance || []}
            itemsPerPage={10}
          />
        </DashboardSection>
      </div>
    </div>
  );
};

export default ManagementDashboard;