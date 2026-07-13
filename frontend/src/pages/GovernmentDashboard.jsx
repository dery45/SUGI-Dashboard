import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Lightbulb, TrendingDown, BarChart3,
  PieChart as PieChartIcon, Award, Warehouse, TrendingUp,
  DollarSign, Target, Truck, Shield,
  Sun, Moon, ChevronRight, Home
} from 'lucide-react';
import { useDashboardFilters } from '../contexts/DashboardFilterContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  KpiCard, ChartCard, DashboardSection, ResponsiveGrid,
  ChartContainer, TableContainer, LoadingSkeleton,
  ExportButton, RefreshButton, ErrorState
} from '../components/dashboard';
import ChartDetailModal from '../components/common/ChartDetailModal';
import ErrorBoundary from '../components/common/ErrorBoundary';
import IndonesiaMap from '../components/map/IndonesiaMap';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { fetchGovtDashboard } from '../api/govtDashboardApi';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

function safeNum(v) { if (v === null || v === undefined || v === '') return 0; const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function fmtNum(v) { const n = safeNum(v); return n.toLocaleString('id-ID'); }
function fmtPct(v) { const n = safeNum(v); if (n === 0 && (v === null || v === undefined || v === '')) return '--%'; return `${n.toFixed(2)}%`; }
function fmtChange(d) { return d?.change != null ? `${d.change > 0 ? '+' : ''}${d.change.toFixed(1)}%` : '-'; }

function cleanCommodityLabel(label) {
  if (!label) return label;
  return label
    .replace(/\s*\(Rp\/[^)]+\)/g, '')
    .replace(/\s*Tk\..*$/g, '')
    .replace(/\s+Tingkat.*$/g, '')
    .replace(/\s*\([^)]*kg[^)]*\)/gi, '')
    .replace(/\s*\([^)]*ekor[^)]*\)/gi, '')
    .replace(/\s*\([^)]*ton[^)]*\)/gi, '')
    .replace(/\s*\([^)]*hidup[^)]*\)/gi, '')
    .trim();
}

const MAP_MODES = [
  { key: 'pou', label: 'PoU Provinsi', unit: '%', valueKey: 'pou', dataKey: 'mapPou', color: '#ef4444' },
  { key: 'konsumen', label: 'Harga Konsumen', unit: 'Rp', valueKey: 'harga', dataKey: 'mapKonsumen', color: '#10b981' },
  { key: 'produsen', label: 'Harga Produsen', unit: 'Rp', valueKey: 'harga', dataKey: 'mapProdusen', color: '#f59e0b' },
  { key: 'cppd', label: 'Cadangan Pangan', unit: 'Ton', valueKey: 'ton', dataKey: 'mapCppd', color: '#0ea5e9' },
  { key: 'gpm', label: 'GPM', unit: 'Kegiatan', valueKey: 'kegiatan', dataKey: 'mapGpm', color: '#8b5cf6' },
];

const KPI_CONFIG = [
  { key: 'neraca', icon: BarChart3, gradient: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20', iconColor: 'text-emerald-400', fmt: (v) => `${fmtNum(v)} Ton`, tooltip: 'Selisih antara ketersediaan dan kebutuhan pangan nasional' },
  { key: 'pph', icon: Award, gradient: 'from-blue-500/20 to-blue-500/5 border-blue-500/20', iconColor: 'text-blue-400', fmt: (v) => `${safeNum(v).toFixed(2)}`, tooltip: 'Skor Pola Pangan Harapan — mengukur mutu dan keragaman konsumsi pangan (target: 100)' },
  { key: 'gpm', icon: Target, gradient: 'from-violet-500/20 to-violet-500/5 border-violet-500/20', iconColor: 'text-violet-400', fmt: (v) => `${fmtNum(v)} Kegiatan`, tooltip: 'Jumlah kegiatan Gerakan Pangan Murah yang dilaksanakan' },
  { key: 'cppd', icon: Shield, gradient: 'from-sky-500/20 to-sky-500/5 border-sky-500/20', iconColor: 'text-sky-400', fmt: (v) => `${fmtNum(v)} Ton`, tooltip: 'Total cadangan pangan yang tersimpan di daerah' },
];

const EMPTY_MSG = {
  1: { title: 'Belum ada data PoU Nasional', desc: 'Data proporsi penduduk dengan asupan kalori di bawah kebutuhan minimum dari database Ketidakcukupan Konsumsi Pangan Nasional belum tersedia.' },
  2: { title: 'Belum ada data Skor PPH', desc: 'Data skor Pola Pangan Harapan (PPH) nasional dari database Skor PPH belum tersedia.' },
  3: { title: 'Belum ada data neraca', desc: 'Data proyeksi neraca beras nasional dari database Proyeksi Neraca belum tersedia untuk filter saat ini.' },
  4: { title: 'Belum ada data konsumsi', desc: 'Data indeks konsumsi pangan per jenis dari database Konsumsi Pangan per Jenis belum tersedia.' },
  5: { title: 'Belum ada data harga konsumen', desc: 'Data rata-rata harga konsumen per komoditas dari database Harga Konsumen Provinsi belum tersedia untuk filter saat ini.' },
  6: { title: 'Belum ada data harga produsen', desc: 'Data rata-rata harga produsen per komoditas dari database Harga Produsen Provinsi belum tersedia untuk filter saat ini.' },
  7: { title: 'Belum ada data donasi', desc: 'Data penyaluran donasi pangan dari database Penyaluran Donasi Pangan belum tersedia untuk filter saat ini.' },
  8: { title: 'Belum ada food rescue', desc: 'Data pangan terselamatkan (food rescue) dari database Pangan Terselamatkan belum tersedia untuk filter saat ini.' },
};
const TABLE_EMPTY = {
  pou: { title: 'Belum ada data PoU Nasional', desc: 'Data ketidakcukupan konsumsi pangan nasional dari database Ketidakcukupan Nasional belum tersedia.' },
  cppd: { title: 'Belum ada data CPPD', desc: 'Data cadangan pangan daerah per provinsi dari database Cadangan Pangan Provinsi belum tersedia.' },
  gpm: { title: 'Belum ada data GPM', desc: 'Data realisasi Gerakan Pangan Murah dari database GPM belum tersedia.' },
  donasi: { title: 'Belum ada data donasi', desc: 'Data penyaluran donasi pangan dari database Penyaluran Donasi belum tersedia.' },
  neraca: { title: 'Belum ada neraca pangan', desc: 'Data proyeksi ketersediaan dan kebutuhan pangan dari database Proyeksi Neraca belum tersedia.' },
  pouProv: { title: 'Belum ada data PoU Provinsi', desc: 'Data prevalensi ketidakcukupan konsumsi per provinsi dari database Ketidakcukupan Provinsi belum tersedia.' },
};

const GovernmentDashboard = () => {
  const { filters, setFilter, options } = useDashboardFilters();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policyInsight, setPolicyInsight] = useState(null);
  const [selectedMap, setSelectedMap] = useState('pou');
  const [selectedChart, setSelectedChart] = useState(null);
  const abortRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const result = await fetchGovtDashboard(filters, controller.signal);
      if (!controller.signal.aborted) setData(result);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Gagal memuat data');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/insights?source=policy_recommendation`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        if (!res.ok) return;
        const j = await res.json();
        if (j.success && j.data?.length) setPolicyInsight(j.data[0]);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const currentMap = MAP_MODES.find(m => m.key === selectedMap);
  const mapData = data?.[currentMap?.dataKey] || [];

  const handleDrillDown = useCallback((province) => {
    if (province) {
      const detailData = mapData.filter(d =>
        (d.provinsi || d.wilayah)?.toLowerCase() === province.toLowerCase()
      );
      setSelectedChart({
        title: `Detail ${currentMap?.label || 'Peta'} — ${province}`,
        desc: `${detailData.length} data point tersedia`,
        data: detailData,
        xKey: currentMap?.valueKey === 'pou' ? 'pou' : 'harga',
        keys: [currentMap?.valueKey || 'value'],
        colors: [currentMap?.color || '#0ea5e9'],
        chart: 'bar',
      });
    }
  }, [mapData, currentMap]);

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-10 animate-fade-in pb-16">
        <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex items-center justify-between">
          <div>
            <div className="w-48 h-6 bg-border/40 rounded-full animate-pulse" />
            <div className="w-72 h-3 bg-border/20 rounded-full animate-pulse mt-2" />
          </div>
          <div className="w-10 h-10 bg-border/30 rounded-xl animate-pulse" />
        </div>
        <LoadingSkeleton variant="kpi" count={4} />
        <LoadingSkeleton variant="map" count={1} />
        <LoadingSkeleton variant="chart" count={8} />
      </div>
    );
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const d = data || {};
  const k = d.kpis || {};

  const chartWidgets = [
    { id: 1, title: 'Tren PoU Nasional', desc: 'Proporsi penduduk dengan asupan kalori di bawah kebutuhan minimum', icon: TrendingDown, color: '#ef4444', chart: 'line', data: d.chartPouTrend || [], xKey: 'tahun', keys: ['pou'], colors: ['#ef4444'] },
    { id: 2, title: 'Skor PPH Nasional', desc: 'Indikator mutu dan keragaman konsumsi pangan', icon: Award, color: '#0ea5e9', chart: 'line', data: d.chartPphTrend || [], xKey: 'tahun', keys: ['skor'], colors: ['#0ea5e9'] },
    { id: 3, title: 'Proyeksi Neraca Beras (Ton)', desc: 'Ketersediaan vs Kebutuhan', icon: BarChart3, color: '#10b981', chart: 'bar', data: d.chartNeraca || [], xKey: 'bulan', keys: ['ketersediaan', 'kebutuhan', 'surplus'], colors: ['#10b981', '#6366f1', '#f43f5e'] },
    { id: 4, title: 'Indeks Konsumsi per Jenis Pangan', desc: 'Pangsa konsumsi masyarakat per komoditas', icon: PieChartIcon, color: '#8b5cf6', chart: 'pie', data: d.chartKonsumsi || [], nameKey: 'komoditas', dataKey: 'nilai' },
    { id: 5, title: 'Harga Konsumen Provinsi (Rp/Kg)', desc: 'Rata-rata harga per komoditas', icon: DollarSign, color: '#10b981', chart: 'bar', data: (d.chartPriceKonsumen || []).map(i => ({ ...i, komoditas: cleanCommodityLabel(i.komoditas) })), xKey: 'komoditas', keys: ['harga'], colors: ['#10b981'] },
    { id: 6, title: 'Harga Produsen Provinsi (Rp/Kg)', desc: 'Rata-rata harga di tingkat produsen', icon: TrendingUp, color: '#f59e0b', chart: 'bar', data: (d.chartPriceProdusen || []).map(i => ({ ...i, komoditas: cleanCommodityLabel(i.komoditas) })), xKey: 'komoditas', keys: ['harga'], colors: ['#f59e0b'] },
    { id: 7, title: 'Donasi Pangan (Kg)', desc: 'Penyaluran donasi pangan per bulan', icon: Truck, color: '#06b6d4', chart: 'bar', data: d.chartDonasi || [], xKey: 'bulan', keys: ['donasi_kg', 'penerima'], colors: ['#06b6d4', '#8b5cf6'] },
    { id: 8, title: 'Pangan Terselamatkan (Kg)', desc: 'Food rescue per bulan', icon: Warehouse, color: '#14b8a6', chart: 'bar', data: d.chartRescue || [], xKey: 'bulan', keys: ['kg'], colors: ['#14b8a6'] },
  ];

  return (
    <div className="flex flex-col gap-10 animate-fade-in pb-16">

      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-muted/50" aria-label="Breadcrumb">
        <Home className="w-3 h-3" />
        <span>Beranda</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground/70 font-semibold">Dashboard Pemerintah</span>
      </nav>

      {/* ─── Header ─── */}
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Dashboard Pemerintah</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">
                National Food Security Analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Tahun</label>
              <select value={filters.year} onChange={e => setFilter('year', e.target.value)}
                className="bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer min-w-[90px]" aria-label="Filter tahun">
                <option value="all">Semua Tahun</option>
                {(options.years || [2025, 2024, 2023, 2022, 2021]).map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Komoditas</label>
              <select value={filters.commodity} onChange={e => setFilter('commodity', e.target.value)}
                className="bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer min-w-[180px]" aria-label="Filter komoditas">
                <option value="all">Semua Komoditas</option>
                {(options.commodities || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-border/40 hover:border-primary/40 text-muted hover:text-primary transition-all"
              aria-label={theme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              tabIndex={0}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── KPI Cards (2×2) ─── */}
      <ResponsiveGrid cols={2}>
        {KPI_CONFIG.map(cfg => {
          const kpi = k[cfg.key] || {};
          return (
            <ErrorBoundary key={cfg.key} name={cfg.key} title={`KPI ${cfg.key} gagal dimuat`}>
              <KpiCard
                label={kpi.label || cfg.key}
                value={cfg.fmt(kpi.current)}
                sub={kpi.sub}
                detail={cfg.detail ? cfg.detail(kpi) : kpi.detail}
                tooltip={cfg.tooltip}
                icon={cfg.icon}
                gradient={cfg.gradient}
                iconColor={cfg.iconColor}
              />
            </ErrorBoundary>
          );
        })}
      </ResponsiveGrid>

      {/* ─── Insight Palace ─── */}
      <ErrorBoundary name="insight" title="Rekomendasi gagal dimuat">
        <div className="bg-gradient-to-br from-primary/[0.03] to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-primary/20 shadow-lg">
          <div className="flex gap-5 items-start">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-black text-foreground tracking-tight">Rekomendasi Kebijakan</h3>
              <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">{policyInsight?.insight || 'Memuat rekomendasi...'}</p>
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* ─── Interactive Map ─── */}
      <ErrorBoundary name="map" title="Peta gagal dimuat">
        <div className="bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30 shadow-lg">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full" />
              <h2 className="text-lg font-black text-foreground tracking-tight">Peta Interaktif</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedMap}
                onChange={e => setSelectedMap(e.target.value)}
                className="bg-background/60 border border-border/50 text-foreground rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer backdrop-blur-sm min-w-[180px]"
                aria-label="Mode peta"
              >
                {MAP_MODES.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
              <ExportButton data={mapData} filename={`peta-${selectedMap}.csv`} columns={Object.keys(mapData[0] || {}).map(k => ({ header: k, accessor: k }))} />
              <RefreshButton onClick={fetchData} loading={loading} />
            </div>
          </div>
          <ChartContainer loading={loading} isEmpty={!mapData.length} emptyTitle="Pilih komoditas/tahun untuk melihat data peta">
            <div className="w-full min-h-[480px]">
              <IndonesiaMap key={currentMap?.dataKey || 'map'} mapKey={currentMap?.dataKey || 'map'}
                provinceData={mapData}
                valueKey={currentMap?.valueKey || 'pou'}
                unit={currentMap?.unit || ''}
                onProvinceClick={handleDrillDown}
              />
            </div>
          </ChartContainer>
        </div>
      </ErrorBoundary>

      {/* ─── National Analytics Charts ─── */}
      <DashboardSection
        title="Analisis Nasional"
        subtitle="6 Grafik Utama"
        accent="from-blue-400 to-blue-600"
        action={<><ExportButton data={chartWidgets.flatMap(w => w.data)} filename="analisis-nasional.csv" columns={[]} /><RefreshButton onClick={fetchData} loading={loading} /></>}
      >
        <ResponsiveGrid cols={2}>
          {chartWidgets.slice(0, 6).map(c => (
            <ErrorBoundary key={c.id} name={`chart-${c.id}`} title={`${c.title} gagal dimuat`}>
              <ChartContainer loading={loading} isEmpty={!c.data?.length} emptyTitle={EMPTY_MSG[c.id]?.title} emptyDesc={EMPTY_MSG[c.id]?.desc}>
                <ChartCard
                  title={`${c.id}. ${c.title}`}
                  info={c.desc}
                  desc={c.desc}
                  icon={c.icon}
                  color={c.color}
                  onClick={() => setSelectedChart(c)}
                >
                  <div className="h-[280px]">
                    {c.chart === 'line' ? (
                      <LineChart data={c.data} xKey={c.xKey} lineKeys={c.keys} colors={c.colors} />
                    ) : c.chart === 'pie' ? (
                      <div className="h-full flex items-center justify-center">
                        <PieChart data={c.data} nameKey={c.nameKey} dataKey={c.dataKey} />
                      </div>
                    ) : (
                      <BarChart data={c.data} xKey={c.xKey} barKeys={c.keys} colors={c.colors} />
                    )}
                  </div>
                </ChartCard>
              </ChartContainer>
            </ErrorBoundary>
          ))}
        </ResponsiveGrid>
      </DashboardSection>

      {/* ─── Distribution & Intervention Charts ─── */}
      <DashboardSection
        title="Distribusi & Intervensi Pangan"
        subtitle="Donasi, Penyelamatan, & Program Pemerintah"
        accent="from-cyan-400 to-cyan-600"
      >
        <ResponsiveGrid cols={2}>
          {chartWidgets.slice(6).map(c => (
            <ErrorBoundary key={c.id} name={`chart-${c.id}`} title={`${c.title} gagal dimuat`}>
              <ChartContainer loading={loading} isEmpty={!c.data?.length} emptyTitle={EMPTY_MSG[c.id]?.title} emptyDesc={EMPTY_MSG[c.id]?.desc}>
                <ChartCard
                  title={`${c.id}. ${c.title}`}
                  info={c.desc}
                  desc={c.desc}
                  icon={c.icon}
                  color={c.color}
                  onClick={() => setSelectedChart(c)}
                >
                  <div className="h-[280px]">
                    <BarChart data={c.data} xKey={c.xKey} barKeys={c.keys} colors={c.colors} />
                  </div>
                </ChartCard>
              </ChartContainer>
            </ErrorBoundary>
          ))}
        </ResponsiveGrid>
      </DashboardSection>

      {/* ─── Provincial Rankings ─── */}
      <DashboardSection
        title="Analisis Provinsi"
        subtitle="Peringkat & Perbandingan"
        accent="from-violet-400 to-violet-600"
      >
        <ResponsiveGrid cols={3}>
          <ErrorBoundary name="cppd-ranking" title="Ranking CPPD gagal dimuat">
            <ChartContainer loading={loading} isEmpty={!d.chartCppdRanking?.length} emptyTitle="Belum ada data CPPD" emptyDesc="Data cadangan pangan daerah per provinsi dari database Cadangan Pangan Provinsi belum tersedia.">
              <ChartCard title="Cadangan Pangan Daerah (Ton)" info="CPPD per provinsi" onClick={() => setSelectedChart({ title: 'CPPD per Provinsi', data: d.chartCppdRanking || [], xKey: 'wilayah', keys: ['ton'], colors: ['#0ea5e9'], chart: 'bar' })}>
                <div className="h-[260px]">
                  <BarChart data={d.chartCppdRanking || []} xKey="wilayah" barKeys={['ton']} colors={['#0ea5e9']} />
                </div>
              </ChartCard>
            </ChartContainer>
          </ErrorBoundary>
          <ErrorBoundary name="pou-ranking" title="Ranking PoU gagal dimuat">
            <ChartContainer loading={loading} isEmpty={!d.chartPouProvRanking?.length} emptyTitle="Belum ada data PoU Provinsi" emptyDesc="Data prevalensi ketidakcukupan konsumsi per provinsi dari database Ketidakcukupan Provinsi belum tersedia.">
              <ChartCard title="PoU per Provinsi (%)" info="Prevalence of Undernourishment" onClick={() => setSelectedChart({ title: 'PoU per Provinsi', data: d.chartPouProvRanking || [], xKey: 'provinsi', keys: ['pou'], colors: ['#ef4444'], chart: 'bar' })}>
                <div className="h-[260px]">
                  <BarChart data={d.chartPouProvRanking || []} xKey="provinsi" barKeys={['pou']} colors={['#ef4444']} />
                </div>
              </ChartCard>
            </ChartContainer>
          </ErrorBoundary>
          <ErrorBoundary name="gpm-ranking" title="Ranking GPM gagal dimuat">
            <ChartContainer loading={loading} isEmpty={!d.chartGpmRanking?.length} emptyTitle="Belum ada data GPM" emptyDesc="Data kegiatan Gerakan Pangan Murah per provinsi dari database GPM belum tersedia.">
              <ChartCard title="Gerakan Pangan Murah" info="Jumlah kegiatan per provinsi" onClick={() => setSelectedChart({ title: 'GPM per Provinsi', data: d.chartGpmRanking || [], xKey: 'provinsi', keys: ['kegiatan'], colors: ['#8b5cf6'], chart: 'bar' })}>
                <div className="h-[260px]">
                  <BarChart data={d.chartGpmRanking || []} xKey="provinsi" barKeys={['kegiatan']} colors={['#8b5cf6']} />
                </div>
              </ChartCard>
            </ChartContainer>
          </ErrorBoundary>
        </ResponsiveGrid>
      </DashboardSection>

      {/* ─── Data Tables ─── */}
      <DashboardSection
        title="Ringkasan Data"
        subtitle="5 Tabel dengan Pencarian & Paginasi"
        accent="from-indigo-400 to-indigo-600"
      >
        <ResponsiveGrid cols={2}>
          <ErrorBoundary name="table-pou" title="Tabel PoU gagal dimuat">
            <TableContainer
              title="Data PoU Nasional"
              subtitle="Tren ketidakcukupan konsumsi per tahun"
              loading={loading}
              isEmpty={!d.tablePou?.data?.length}
              emptyTitle={TABLE_EMPTY.pou.title}
              emptyDesc={TABLE_EMPTY.pou.desc}
              columns={[
                { header: 'Tahun', accessor: 'tahun' },
                { header: 'PoU (%)', accessor: 'pou', format: (v) => fmtPct(v) },
                { header: 'Jumlah Penduduk', accessor: 'jumlah_penduduk', format: (v) => fmtNum(v) },
                { header: 'Undernourish', accessor: 'penduduk_undernourish', format: (v) => fmtNum(v) },
              ]}
              data={d.tablePou?.data || []}
              itemsPerPage={10}
            />
          </ErrorBoundary>

          <ErrorBoundary name="table-cppd" title="Tabel CPPD gagal dimuat">
            <TableContainer
              title="Cadangan Pangan Daerah (CPPD)"
              subtitle="Cadangan pangan per provinsi"
              loading={loading}
              isEmpty={!d.tableCppd?.data?.length}
              emptyTitle={TABLE_EMPTY.cppd.title}
              emptyDesc={TABLE_EMPTY.cppd.desc}
              columns={[
                { header: 'Tahun', accessor: 'tahun' },
                { header: 'Bulan', accessor: 'bulan' },
                { header: 'Wilayah', accessor: 'wilayah' },
                { header: 'Kode Wilayah', accessor: 'kode_wilayah' },
                { header: 'CPPD (Ton)', accessor: 'cppd_ton', format: (v) => `${fmtNum(v)} Ton` },
              ]}
              data={d.tableCppd?.data || []}
              itemsPerPage={10}
            />
          </ErrorBoundary>

          <ErrorBoundary name="table-gpm" title="Tabel GPM gagal dimuat">
            <TableContainer
              title="Gerakan Pangan Murah"
              subtitle="Realisasi program pemerintah"
              loading={loading}
              isEmpty={!d.tableGpm?.data?.length}
              emptyTitle={TABLE_EMPTY.gpm.title}
              emptyDesc={TABLE_EMPTY.gpm.desc}
              columns={[
                { header: 'Tahun', accessor: 'tahun' },
                { header: 'Bulan', accessor: 'bulan' },
                { header: 'Provinsi', accessor: 'provinsi' },
                { header: 'Kab/Kota', accessor: 'kab_kota' },
                { header: 'Pelaksanaan', accessor: 'pelaksana', format: (v) => fmtNum(v) },
              ]}
              data={d.tableGpm?.data || []}
              itemsPerPage={10}
            />
          </ErrorBoundary>

          <ErrorBoundary name="table-donasi" title="Tabel Donasi gagal dimuat">
            <TableContainer
              title="Penyaluran Donasi"
              subtitle="Donasi pangan per bulan"
              loading={loading}
              isEmpty={!d.tableDonasi?.data?.length}
              emptyTitle={TABLE_EMPTY.donasi.title}
              emptyDesc={TABLE_EMPTY.donasi.desc}
              columns={[
                { header: 'Tahun', accessor: 'tahun' },
                { header: 'Bulan', accessor: 'bulan' },
                { header: 'Donasi (Kg)', accessor: 'jumlah_donasi_kg', format: (v) => fmtNum(v) },
                { header: 'Penerima', accessor: 'penerima_manfaat_jiwa', format: (v) => fmtNum(v) },
              ]}
              data={d.tableDonasi?.data || []}
              itemsPerPage={10}
            />
          </ErrorBoundary>
        </ResponsiveGrid>

        <div className="mt-8">
          <ErrorBoundary name="table-neraca" title="Tabel Neraca gagal dimuat">
            <TableContainer
              title="Data Neraca Pangan"
              subtitle="Proyeksi ketersediaan dan kebutuhan"
              loading={loading}
              isEmpty={!d.tableNeraca?.data?.length}
              emptyTitle={TABLE_EMPTY.neraca.title}
              emptyDesc={TABLE_EMPTY.neraca.desc}
              columns={[
                { header: 'Tahun', accessor: 'tahun' },
                { header: 'Bulan', accessor: 'bulan' },
                { header: 'Komoditas', accessor: 'komoditas' },
                { header: 'Status', accessor: 'status' },
                { header: 'Tingkat', accessor: 'tingkat' },
                { header: 'Ketersediaan', accessor: 'ketersediaan', format: (v) => fmtNum(v) },
                { header: 'Kebutuhan', accessor: 'kebutuhan', format: (v) => fmtNum(v) },
                { header: 'Neraca', accessor: 'neraca', format: (v) => fmtNum(v) },
                { header: 'Satuan', accessor: 'satuan' },
              ]}
              data={d.tableNeraca?.data || []}
              itemsPerPage={10}
            />
          </ErrorBoundary>
        </div>
      </DashboardSection>

      <ChartDetailModal
        isOpen={!!selectedChart}
        onClose={() => setSelectedChart(null)}
        chart={selectedChart}
      />
    </div>
  );
};

export default GovernmentDashboard;
