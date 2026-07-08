import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Lightbulb, TrendingUp, DollarSign, Activity, Target, Award,
  BarChart3, MapPin, LineChart as LineChartIcon, TrendingDown,
  Shield, AlertTriangle, Info, Truck, Warehouse, Package,
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
import DataTable from '../components/common/DataTable';
import { fetchFarmerDashboard } from '../api/farmerDashboardApi';

function safeNum(v) { if (v === null || v === undefined || v === '') return 0; const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function fmtNum(v) { const n = safeNum(v); return n.toLocaleString('id-ID'); }
function fmtRupiah(v) { const n = safeNum(v); if (n === 0 && (v === null || v === undefined || v === '')) return 'Rp --'; return `Rp ${n.toLocaleString('id-ID')}`; }

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

const INSIGHT_ICONS = { warning: AlertTriangle, positive: TrendingUp, info: Info, danger: TrendingDown };
const INSIGHT_COLORS = { warning: 'text-amber-400', positive: 'text-emerald-400', info: 'text-blue-400', danger: 'text-rose-400' };
const INSIGHT_BG = { warning: 'from-amber-500/10', positive: 'from-emerald-500/10', info: 'from-blue-500/10', danger: 'from-rose-500/10' };

const MAP_MODES = [
  { key: 'producer', label: 'Harga Produsen', unit: 'Rp', valueKey: 'harga', dataKey: 'mapProducer', color: '#10b981' },
  { key: 'consumer', label: 'Harga Konsumen', unit: 'Rp', valueKey: 'harga', dataKey: 'mapConsumer', color: '#f59e0b' },
  { key: 'margin', label: 'Margin Harga', unit: 'Rp', valueKey: 'margin', dataKey: 'mapMargin', color: '#8b5cf6' },
  { key: 'opportunity', label: 'Peluang Komoditas', unit: 'Rp', valueKey: 'harga', dataKey: 'mapOpportunity', color: '#0ea5e9' },
];

const KPI_CONFIG = [
  { key: 'foodBalance', icon: BarChart3, grad: 'from-blue-500/20 to-blue-500/5 border-blue-500/20', ic: 'text-blue-400', fmt: (v) => `${fmtNum(v)} Ton`, tooltip: 'Selisih antara ketersediaan dan kebutuhan pangan nasional. Surplus menandakan pasokan aman.' },
  { key: 'pphScore', icon: BarChart3, grad: 'from-rose-500/20 to-rose-500/5 border-rose-500/20', ic: 'text-rose-400', fmt: (v) => `${safeNum(v).toFixed(2)} / 100`, tooltip: 'Skor Pola Pangan Harapan — mengukur mutu dan keragaman konsumsi pangan (target: 100)' },
  { key: 'bestCommodity', icon: Award, grad: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20', ic: 'text-cyan-400', fmt: (v) => v || '-', tooltip: 'Komoditas dengan harga produsen rata-rata tertinggi' },
  { key: 'highDemand', icon: Target, grad: 'from-teal-500/20 to-teal-500/5 border-teal-500/20', ic: 'text-teal-400', fmt: (v) => v || '-', tooltip: 'Komoditas dengan konsumsi pangan tertinggi per kapita' },
];

const FarmerDashboard = () => {
  const { filters, setFilter, options } = useDashboardFilters();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMap, setSelectedMap] = useState('producer');
  const [selectedChart, setSelectedChart] = useState(null);
  const abortRef = useRef(null);

  const commodities = options?.commodities || [];

  const EMPTY_MSG = {
    1: { title: 'Belum ada data harga produsen', desc: 'Data rata-rata harga produsen per komoditas per bulan dari database Harga Produsen Nasional belum tersedia untuk filter saat ini.' },
    2: { title: 'Belum ada data harga konsumen', desc: 'Data rata-rata harga konsumen per komoditas per bulan dari database Harga Konsumen Nasional belum tersedia untuk filter saat ini.' },
    3: { title: 'Belum ada peringkat komoditas', desc: 'Data peringkat harga produsen rata-rata per komoditas belum tersedia untuk filter saat ini.' },
    4: { title: 'Belum ada data Skor PPH', desc: 'Data perkembangan skor Pola Pangan Harapan (PPH) nasional per tahun belum tersedia.' },
    5: { title: 'Belum ada data margin', desc: 'Data selisih harga produsen dan konsumen per bulan belum tersedia untuk filter saat ini.' },
    6: { title: 'Belum ada sebaran harga', desc: 'Data harga rata-rata per provinsi dari database Harga Produsen Provinsi belum tersedia untuk filter saat ini.' },
    7: { title: 'Belum ada data ketersediaan', desc: 'Data neraca pangan nasional per bulan dari database Proyeksi Neraca belum tersedia untuk filter saat ini.' },
    8: { title: 'Belum ada neraca per komoditas', desc: 'Data surplus/defisit per komoditas dari database Proyeksi Neraca belum tersedia.' },
    9: { title: 'Belum ada peluang pasar', desc: 'Data provinsi dengan harga produsen tertinggi belum tersedia untuk filter saat ini.' },
    10: { title: 'Belum ada cadangan pangan', desc: 'Data cadangan pangan per provinsi dari database Cadangan Pangan Provinsi belum tersedia.' },
  };
  const TABLE_EMPTY = {
    prices: { title: 'Belum ada data harga produsen', desc: 'Data harga produsen per komoditas, tahun, dan bulan dari database Harga Produsen Nasional belum tersedia.' },
    consumer: { title: 'Belum ada data harga konsumen', desc: 'Data harga konsumen per komoditas, tahun, dan bulan dari database Harga Konsumen Nasional belum tersedia.' },
    balance: { title: 'Belum ada neraca pangan', desc: 'Data ketersediaan dan kebutuhan pangan dari database Proyeksi Neraca belum tersedia.' },
    market: { title: 'Belum ada data pasar', desc: 'Data ringkasan pasar dari database Proyeksi Neraca belum tersedia.' },
  };

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const r = await fetchFarmerDashboard(filters, ctrl.signal);
      if (!ctrl.signal.aborted) setData(r);
    } catch (e) { if (e.name !== 'AbortError') setError(e.message || 'Gagal memuat data'); }
    finally { if (!ctrl.signal.aborted) setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const d = data || {};
  const k = d.kpis || {};
  const insights = d.insights || [];

  const currentMap = MAP_MODES.find(m => m.key === selectedMap);
  const mapData = d[currentMap?.dataKey] || [];
  const sebaranData = (d.chartProvPriceDist || []).filter(
    i => filters.commodity === 'all' || (i.komoditas || '').toLowerCase() === filters.commodity.toLowerCase()
  );

  const handleDrillDown = useCallback((province) => {
    if (!province) return;
    const detailData = mapData.filter(item =>
      (item.provinsi || item.wilayah)?.toLowerCase() === province.toLowerCase()
    );
    setSelectedChart({
      title: `Detail ${currentMap?.label || 'Peta'} — ${province}`,
      desc: `${detailData.length} data point tersedia`,
      data: detailData,
      xKey: currentMap?.valueKey === 'margin' ? 'margin' : 'harga',
      keys: [currentMap?.valueKey || 'harga'],
      colors: [currentMap?.color || '#10b981'],
      chart: 'bar',
    });
  }, [mapData, currentMap]);

  const chartWidgets = [
    { id: 1, title: 'Tren Harga Produsen', desc: 'Rata-rata harga per komoditas per bulan', icon: TrendingUp, color: '#10b981', chart: 'line', data: d.chartProducerTrend || [], xKey: 'bulan', keys: ['harga'], colors: ['#10b981'], groupKey: 'komoditas' },
    { id: 2, title: 'Tren Harga Konsumen', desc: 'Rata-rata harga konsumen per komoditas', icon: DollarSign, color: '#f59e0b', chart: 'line', data: d.chartConsumerTrend || [], xKey: 'bulan', keys: ['harga'], colors: ['#f59e0b'], groupKey: 'komoditas' },
    { id: 3, title: 'Peringkat Komoditas', desc: 'Harga produsen rata-rata per komoditas', icon: Award, color: '#0ea5e9', chart: 'bar', data: (d.chartCommodityRanking || []).map(i => ({ ...i, komoditas: cleanCommodityLabel(i.komoditas) })), xKey: 'komoditas', keys: ['harga'], colors: ['#0ea5e9'] },
    { id: 4, title: 'Skor PPH (Pola Pangan Harapan)', desc: 'Perkembangan skor PPH nasional per tahun', icon: BarChart3, color: '#ef4444', chart: 'line', data: d.chartPphScore || [], xKey: 'tahun', keys: ['pph_ketersediaan'], colors: ['#ef4444'] },
    { id: 5, title: 'Margin Produsen-Konsumen', desc: 'Selisih harga per bulan per komoditas', icon: BarChart3, color: '#8b5cf6', chart: 'bar', data: d.chartMarginTrend || [], xKey: 'bulan', keys: ['produsen', 'konsumen', 'margin'], colors: ['#10b981', '#f59e0b', '#8b5cf6'] },
    { id: 6, title: 'Sebaran Harga Produsen', desc: 'Harga rata-rata per provinsi', icon: MapPin, color: '#14b8a6', chart: 'bar', data: sebaranData, xKey: 'provinsi', keys: ['harga'], colors: ['#14b8a6'] },
    { id: 7, title: 'Ketersediaan vs Kebutuhan', desc: 'Neraca pangan nasional per bulan', icon: Truck, color: '#06b6d4', chart: 'bar', data: d.chartSupplyDemand || [], xKey: 'bulan', keys: ['ketersediaan', 'kebutuhan', 'surplus'], colors: ['#06b6d4', '#f43f5e', '#10b981'] },
    { id: 8, title: 'Neraca per Komoditas', desc: 'Surplus/defisit per komoditas', icon: Warehouse, color: '#6366f1', chart: 'bar', data: d.chartCommodityBalance || [], xKey: 'komoditas', keys: ['ketersediaan', 'kebutuhan', 'surplus'], colors: ['#6366f1', '#f43f5e', '#10b981'] },
    { id: 9, title: 'Peluang Pasar Terbaik', desc: 'Provinsi dengan harga produsen tertinggi', icon: Target, color: '#0ea5e9', chart: 'bar', data: d.chartOpportunity || [], xKey: 'provinsi', keys: ['harga'], colors: ['#0ea5e9'] },
    { id: 10, title: 'Cadangan Pangan Daerah', desc: 'Cadangan pangan per provinsi (ton)', icon: Warehouse, color: '#f59e0b', chart: 'bar', data: d.chartCppd || [], xKey: 'wilayah', keys: ['ton'], colors: ['#f59e0b'] },
  ];

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-10 animate-fade-in pb-16">
        <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex items-center justify-between">
          <div>
            <div className="w-56 h-6 bg-border/40 rounded-full animate-pulse" />
            <div className="w-80 h-3 bg-border/20 rounded-full animate-pulse mt-2" />
          </div>
          <div className="w-10 h-10 bg-border/30 rounded-xl animate-pulse" />
        </div>
        <LoadingSkeleton variant="kpi" count={4} />
        <LoadingSkeleton variant="map" count={1} />
        <LoadingSkeleton variant="chart" count={10} />
      </div>
    );
  }

  if (error && !data) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="flex flex-col gap-10 animate-fade-in pb-16">

      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-muted/50" aria-label="Breadcrumb">
        <Home className="w-3 h-3" />
        <span>Beranda</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground/70 font-semibold">Dashboard Petani</span>
      </nav>

      {/* ─── Header with global year filter ─── */}
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Dashboard Petani</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">
                Market Intelligence & Commodity Analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Tahun</label>
              <select value={filters.year} onChange={e => setFilter('year', e.target.value)}
                className="bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer min-w-[90px]" aria-label="Filter tahun">
                <option value="all">Semua Tahun</option>
                {[2025, 2024, 2023, 2022, 2021].map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Komoditas</label>
              <select value={filters.commodity} onChange={e => setFilter('commodity', e.target.value)}
                className="bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer min-w-[180px]" aria-label="Filter komoditas">
                <option value="all">Semua Komoditas</option>
                {commodities.map(c => <option key={c} value={c}>{c}</option>)}
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

      {/* ─── KPI Cards (2x2) ─── */}
      <ResponsiveGrid cols={2}>
        {KPI_CONFIG.map(cfg => {
          const v = k[cfg.key] || {};
          return (
            <ErrorBoundary key={cfg.key} name={cfg.key} title={`KPI ${cfg.key} gagal dimuat`}>
              <KpiCard
                label={v.label || cfg.key}
                value={cfg.fmt(v.current)}
                sub={v.sub}
                tooltip={cfg.tooltip}
                icon={cfg.icon}
                gradient={cfg.grad}
                iconColor={cfg.ic}
              />
            </ErrorBoundary>
          );
        })}
      </ResponsiveGrid>

      {/* ─── Smart Insight Panel ─── */}
      {insights.length > 0 && (
        <ErrorBoundary name="insight" title="Market intelligence gagal dimuat">
          <div className="bg-gradient-to-br from-primary/[0.03] to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-primary/20 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-black text-foreground tracking-tight">Market Intelligence</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((ins, i) => {
                const Icon = INSIGHT_ICONS[ins.type] || Info;
                const color = INSIGHT_COLORS[ins.type] || 'text-muted';
                const bg = INSIGHT_BG[ins.type] || 'from-muted/10';
                return (
                  <div key={i} className={`bg-gradient-to-br ${bg} to-transparent backdrop-blur-sm p-4 rounded-2xl border border-border/30`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{ins.title}</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">{ins.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </ErrorBoundary>
      )}

      {/* ─── Interactive Map (inline commodity filter) ─── */}
      <ErrorBoundary name="map" title="Peta gagal dimuat">
        <div className="bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30 shadow-lg">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
              <h2 className="text-lg font-black text-foreground tracking-tight">Peta Interaktif</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={selectedMap} onChange={e => setSelectedMap(e.target.value)}
                className="bg-background/60 border border-border/50 text-foreground rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer backdrop-blur-sm min-w-[160px]" aria-label="Mode peta">
                {MAP_MODES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
              <ExportButton data={mapData} filename={`peta-${selectedMap}.csv`} columns={Object.keys(mapData[0] || {}).map(k => ({ header: k, accessor: k }))} />
              <RefreshButton onClick={fetchData} loading={loading} />
            </div>
          </div>
          <ChartContainer loading={loading} isEmpty={!mapData.length} emptyTitle="Pilih komoditas/tahun untuk melihat data peta">
            <div className="w-full min-h-[480px]">
              <IndonesiaMap key={currentMap?.dataKey || 'map'} mapKey={currentMap?.dataKey || 'map'} provinceData={mapData} valueKey={currentMap?.valueKey || 'harga'} unit={currentMap?.unit || ''} onProvinceClick={handleDrillDown} />
            </div>
          </ChartContainer>
        </div>
      </ErrorBoundary>

      {/* ─── Commodity Analytics ─── */}
      <DashboardSection title="Analisis Komoditas" subtitle="Harga, Peringkat & Skor PPH" accent="from-emerald-400 to-emerald-600"
        action={<><RefreshButton onClick={fetchData} loading={loading} /></>}>
        <ResponsiveGrid cols={2}>
          {chartWidgets.slice(0, 4).map(c => (
            <ErrorBoundary key={c.id} name={`chart-${c.id}`} title={`${c.title} gagal dimuat`}>
              <ChartContainer loading={loading} isEmpty={!c.data?.length} emptyTitle={EMPTY_MSG[c.id]?.title} emptyDesc={EMPTY_MSG[c.id]?.desc}>
                <ChartCard title={`${c.id}. ${c.title}`} info={c.desc} desc={c.desc} icon={c.icon} color={c.color} onClick={() => setSelectedChart(c)}>
                  <div className="h-[280px]">
                    {c.chart === 'line' ? <LineChart data={c.data} xKey={c.xKey} lineKeys={c.keys} colors={c.colors} /> : <BarChart data={c.data} xKey={c.xKey} barKeys={c.keys} colors={c.colors} />}
                  </div>
                </ChartCard>
              </ChartContainer>
            </ErrorBoundary>
          ))}
        </ResponsiveGrid>
      </DashboardSection>

      {/* ─── Market Analytics ─── */}
      <DashboardSection title="Analisis Pasar" subtitle="Margin, Distribusi & Peluang" accent="from-violet-400 to-violet-600">
        <ResponsiveGrid cols={2}>
          {chartWidgets.slice(4, 6).map(c => (
            <ErrorBoundary key={c.id} name={`chart-${c.id}`} title={`${c.title} gagal dimuat`}>
              <ChartContainer key={c.id} loading={loading} isEmpty={!c.data?.length} emptyTitle={EMPTY_MSG[c.id]?.title} emptyDesc={EMPTY_MSG[c.id]?.desc}>
                <ChartCard title={`${c.id}. ${c.title}`} info={c.desc} desc={c.desc} icon={c.icon} color={c.color} onClick={() => setSelectedChart(c)}>
                  <div className="h-[280px]"><BarChart data={c.data} xKey={c.xKey} barKeys={c.keys} colors={c.colors} /></div>
                </ChartCard>
              </ChartContainer>
            </ErrorBoundary>
          ))}
          <ErrorBoundary name="chart-7" title="Ketersediaan vs Kebutuhan gagal dimuat">
            <ChartContainer loading={loading} isEmpty={!d.chartSupplyDemand?.length} emptyTitle={EMPTY_MSG[7]?.title} emptyDesc={EMPTY_MSG[7]?.desc}>
              <ChartCard title="7. Ketersediaan vs Kebutuhan" info="Neraca pangan nasional" desc="Neraca pangan nasional" icon={Truck} color="#06b6d4" onClick={() => setSelectedChart(chartWidgets[6])}>
                <div className="h-[280px]"><BarChart data={d.chartSupplyDemand || []} xKey="bulan" barKeys={['ketersediaan', 'kebutuhan', 'surplus']} colors={['#06b6d4', '#f43f5e', '#10b981']} /></div>
              </ChartCard>
            </ChartContainer>
          </ErrorBoundary>
          <ErrorBoundary name="chart-8" title="Neraca per Komoditas gagal dimuat">
            <ChartContainer loading={loading} isEmpty={!d.chartCommodityBalance?.length} emptyTitle={EMPTY_MSG[8]?.title} emptyDesc={EMPTY_MSG[8]?.desc}>
              <ChartCard title="8. Neraca per Komoditas" info="Surplus/defisit per komoditas" desc="Surplus/defisit per komoditas" icon={Warehouse} color="#6366f1" onClick={() => setSelectedChart(chartWidgets[7])}>
                <div className="h-[280px]"><BarChart data={d.chartCommodityBalance || []} xKey="komoditas" barKeys={['ketersediaan', 'kebutuhan', 'surplus']} colors={['#6366f1', '#f43f5e', '#10b981']} /></div>
              </ChartCard>
            </ChartContainer>
          </ErrorBoundary>
        </ResponsiveGrid>
      </DashboardSection>

      {/* ─── Ranking & Opportunity ─── */}
      <DashboardSection title="Peringkat & Peluang" subtitle="Provinsi dan Komoditas Terbaik" accent="from-sky-400 to-sky-600">
        <ResponsiveGrid cols={2}>
          <ErrorBoundary name="chart-9" title="Peluang Pasar gagal dimuat">
            <ChartContainer loading={loading} isEmpty={!d.chartOpportunity?.length} emptyTitle={EMPTY_MSG[9]?.title} emptyDesc={EMPTY_MSG[9]?.desc}>
              <ChartCard title="9. Peluang Pasar Terbaik" info="Provinsi dengan harga produsen tertinggi" desc="Provinsi dengan harga produsen tertinggi" icon={Target} color="#0ea5e9" onClick={() => setSelectedChart(chartWidgets[8])}>
                <div className="h-[280px]"><BarChart data={d.chartOpportunity || []} xKey="provinsi" barKeys={['harga']} colors={['#0ea5e9']} /></div>
              </ChartCard>
            </ChartContainer>
          </ErrorBoundary>
          <ErrorBoundary name="chart-10" title="Cadangan Pangan gagal dimuat">
            <ChartContainer loading={loading} isEmpty={!d.chartCppd?.length} emptyTitle={EMPTY_MSG[10]?.title} emptyDesc={EMPTY_MSG[10]?.desc}>
              <ChartCard title="10. Cadangan Pangan Daerah" info="Cadangan pangan per provinsi (ton)" desc="Cadangan pangan per provinsi (ton)" icon={Warehouse} color="#f59e0b" onClick={() => setSelectedChart(chartWidgets[9])}>
                <div className="h-[280px]"><BarChart data={d.chartCppd || []} xKey="wilayah" barKeys={['ton']} colors={['#f59e0b']} /></div>
              </ChartCard>
            </ChartContainer>
          </ErrorBoundary>
        </ResponsiveGrid>
      </DashboardSection>

      {/* ─── Data Tables ─── */}
      <DashboardSection title="Ringkasan Data" subtitle="4 Tabel dengan Pencarian & Paginasi" accent="from-indigo-400 to-indigo-600">

        <ResponsiveGrid cols={2}>
          <ErrorBoundary name="table-prices" title="Tabel harga produsen gagal dimuat">
            <TableContainer title="Harga Produsen Nasional" subtitle="Rata-rata harga per komoditas" loading={loading} isEmpty={!d.tablePrices?.data?.length} emptyTitle={TABLE_EMPTY.prices.title} emptyDesc={TABLE_EMPTY.prices.desc}
              columns={[{ header: 'Komoditas', accessor: 'komoditas' }, { header: 'Tahun', accessor: 'tahun' }, { header: 'Bulan', accessor: 'bulan' }, { header: 'Harga (Rp/Kg)', accessor: 'harga', format: v => fmtRupiah(v) }]}
              data={d.tablePrices?.data || []} itemsPerPage={10} />
          </ErrorBoundary>
          <ErrorBoundary name="table-consumer" title="Tabel harga konsumen gagal dimuat">
            <TableContainer title="Harga Konsumen Nasional" subtitle="Rata-rata harga konsumen" loading={loading} isEmpty={!d.tableConsumer?.data?.length} emptyTitle={TABLE_EMPTY.consumer.title} emptyDesc={TABLE_EMPTY.consumer.desc}
              columns={[{ header: 'Komoditas', accessor: 'komoditas' }, { header: 'Tahun', accessor: 'tahun' }, { header: 'Bulan', accessor: 'bulan' }, { header: 'Harga (Rp/Kg)', accessor: 'harga', format: v => fmtRupiah(v) }]}
              data={d.tableConsumer?.data || []} itemsPerPage={10} />
          </ErrorBoundary>
        </ResponsiveGrid>
        <div className="mt-8 flex flex-col gap-8">
          <ErrorBoundary name="table-balance" title="Tabel neraca gagal dimuat">
            <TableContainer title="Neraca Pangan" subtitle="Ketersediaan vs Kebutuhan" loading={loading} isEmpty={!d.tableBalance?.data?.length} emptyTitle={TABLE_EMPTY.balance.title} emptyDesc={TABLE_EMPTY.balance.desc}
              columns={[{ header: 'Tahun', accessor: 'tahun' }, { header: 'Bulan', accessor: 'bulan' }, { header: 'Komoditas', accessor: 'komoditas' }, { header: 'Ketersediaan', accessor: 'ketersediaan', format: v => fmtNum(v) }, { header: 'Kebutuhan', accessor: 'kebutuhan', format: v => fmtNum(v) }, { header: 'Neraca', accessor: 'neraca', format: v => fmtNum(v) }]}
              data={d.tableBalance?.data || []} itemsPerPage={10} />
          </ErrorBoundary>
          <ErrorBoundary name="table-market" title="Tabel data pasar gagal dimuat">
            <TableContainer title="Data Pasar" subtitle="Ringkasan market" loading={loading} isEmpty={!d.tableMarket?.data?.length} emptyTitle={TABLE_EMPTY.market.title} emptyDesc={TABLE_EMPTY.market.desc}
              columns={[{ header: 'Tahun', accessor: 'tahun' }, { header: 'Bulan', accessor: 'bulan' }, { header: 'Komoditas', accessor: 'komoditas' }, { header: 'Status', accessor: 'status' }, { header: 'Ketersediaan', accessor: 'ketersediaan', format: v => fmtNum(v) }, { header: 'Kebutuhan', accessor: 'kebutuhan', format: v => fmtNum(v) }, { header: 'Neraca', accessor: 'neraca', format: v => fmtNum(v) }, { header: 'Satuan', accessor: 'satuan' }]}
              data={d.tableMarket?.data || []} itemsPerPage={10} />
          </ErrorBoundary>
        </div>
      </DashboardSection>

      <ChartDetailModal isOpen={!!selectedChart} onClose={() => setSelectedChart(null)} chart={selectedChart} />
    </div>
  );
};

export default FarmerDashboard;
