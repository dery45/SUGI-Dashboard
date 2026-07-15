import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bot, MessageSquare, Calendar, Search, Sun, Moon,
  Home, ChevronRight, Info, RefreshCw, Activity, Target,
  Brain, Hash, TrendingUp, Map, Table2, Smile,
  FileText, LayoutDashboard, Eye, Clock, Zap, Layers, AlertCircle,
  Share2, GitBranch, Download, Lightbulb, Radar, Network
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Treemap,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

import { useTheme } from '../contexts/ThemeContext';
import {
  fetchChatbotDashboard,
  fetchChatbotActivity, fetchChatbotTopics,
  fetchChatbotEntities, fetchChatbotNer,
  fetchChatbotIntent, triggerNlpProcess,
  fetchSemanticNetwork, fetchKnowledgeGraph,
  fetchRecommendations, fetchProblems,
  fetchTrends, fetchCoverage, fetchInsights,
  semanticSearch
} from '../api/chatbotInsightApi';
import KpiCard from '../components/dashboard/KpiCard';
import DashboardSection from '../components/dashboard/DashboardSection';
import EmptyState from '../components/dashboard/EmptyState';
import ErrorState from '../components/dashboard/ErrorState';
import KnowledgeGraph from '../components/chatbot/KnowledgeGraph';
import InsightPanel from '../components/chatbot/InsightPanel';
import ExportModal from '../components/chatbot/ExportModal';

const TABS = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'activity', label: 'Aktivitas', icon: Activity },
  { id: 'topics', label: 'Topik', icon: Brain },
  { id: 'commodities', label: 'Komoditas', icon: Layers },
  { id: 'location', label: 'Lokasi', icon: Map },
  { id: 'intent', label: 'Intent', icon: Target },
  { id: 'sentiment', label: 'Sentimen', icon: Smile },
  { id: 'entities', label: 'Entitas', icon: Table2 },
  { id: 'semantic', label: 'Jaringan', icon: Share2 },
  { id: 'graph', label: 'Graph', icon: GitBranch },
  { id: 'recommend', label: 'Rekomendasi', icon: Lightbulb },
  { id: 'problems', label: 'Masalah', icon: AlertCircle },
  { id: 'trends', label: 'Tren', icon: TrendingUp },
  { id: 'coverage', label: 'Cakupan', icon: Radar },
  { id: 'search', label: 'Pencarian', icon: Network },
];

const KPI_CONFIG = [
  { key: 'totalSesi', icon: MessageSquare, grad: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20', ic: 'text-emerald-400' },
  { key: 'totalRingkasan', icon: Bot, grad: 'from-blue-500/20 to-blue-500/5 border-blue-500/20', ic: 'text-blue-400' },
  { key: 'totalKarakter', icon: FileText, grad: 'from-purple-500/20 to-purple-500/5 border-purple-500/20', ic: 'text-purple-400' },
  { key: 'avgPanjang', icon: Hash, grad: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20', ic: 'text-cyan-400' },
  { key: 'topikUnik', icon: Brain, grad: 'from-rose-500/20 to-rose-500/5 border-rose-500/20', ic: 'text-rose-400' },
  { key: 'komoditasUnik', icon: Layers, grad: 'from-amber-500/20 to-amber-500/5 border-amber-500/20', ic: 'text-amber-400' },
  { key: 'lokasiUnik', icon: Map, grad: 'from-teal-500/20 to-teal-500/5 border-teal-500/20', ic: 'text-teal-400' },
  { key: 'entitasUnik', icon: Eye, grad: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20', ic: 'text-indigo-400' },
  { key: 'totalRekomendasi', icon: TrendingUp, grad: 'from-lime-500/20 to-lime-500/5 border-lime-500/20', ic: 'text-lime-400' },
  { key: 'totalPermasalahan', icon: AlertCircle, grad: 'from-red-500/20 to-red-500/5 border-red-500/20', ic: 'text-red-400' },
  { key: 'hariPalingAktif', icon: Calendar, grad: 'from-sky-500/20 to-sky-500/5 border-sky-500/20', ic: 'text-sky-400' },
  { key: 'jamPalingAktif', icon: Clock, grad: 'from-violet-500/20 to-violet-500/5 border-violet-500/20', ic: 'text-violet-400' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#e11d48', '#be123c', '#fb7185', '#f472b6', '#c084fc', '#818cf8'];
const SENTIMENT_COLORS = { Positive: '#10b981', Neutral: '#6b7280', Negative: '#ef4444' };
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const SEVERITY_COLORS = { 1: '#d1d5db', 2: '#9ca3af', 3: '#6b7280', 4: '#f59e0b', 5: '#f97316', 6: '#ef4444', 7: '#dc2626', 8: '#b91c1c', 9: '#991b1b', 10: '#7f1d1d' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (<p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>))}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, className }) => (
  <div className={`bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30 shadow-lg ${className || ''}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-foreground truncate">{title}</h3>
        {subtitle && <p className="text-[10px] font-bold text-muted uppercase tracking-wider opacity-60 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const ChatbotInsightDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [topics, setTopics] = useState(null);
  const [entities, setEntities] = useState(null);
  const [ner, setNer] = useState(null);
  const [intent, setIntent] = useState(null);
  const [semantic, setSemantic] = useState(null);
  const [knowledge, setKnowledge] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [problems, setProblems] = useState(null);
  const [trends, setTrends] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [insights, setInsights] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [entitySearch, setEntitySearch] = useState('');
  const [entityResults, setEntityResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({ type: '', intent: '', category: '' });
  const abortRef = useRef(null);

  const fetchAll = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError(null);
    const tabs = ['overview', 'activity', 'topics', 'entities', 'ner', 'intent',
      'semantic', 'knowledge', 'recommendations', 'problems', 'trends', 'coverage', 'insights'];
    setLoading(prev => { const n = {}; tabs.forEach(t => { n[t] = true; }); return { ...prev, ...n }; });

    const safeFetch = async (key, fn, setter) => {
      try { const r = await fn(ctrl.signal); if (!ctrl.signal.aborted) setter(r); }
      catch (e) { if (e.name !== 'AbortError' && key === 'overview') setError(e.message); }
      finally { if (!ctrl.signal.aborted) setLoading(prev => ({ ...prev, [key]: false })); }
    };

    await Promise.all([
      safeFetch('overview', fetchChatbotDashboard.bind(null, {}), setData),
      safeFetch('activity', fetchChatbotActivity, setActivity),
      safeFetch('topics', fetchChatbotTopics, setTopics),
      safeFetch('entities', fetchChatbotEntities.bind(null, ''), setEntities),
      safeFetch('ner', fetchChatbotNer, setNer),
      safeFetch('intent', fetchChatbotIntent, setIntent),
      safeFetch('semantic', fetchSemanticNetwork, setSemantic),
      safeFetch('knowledge', fetchKnowledgeGraph, setKnowledge),
      safeFetch('recommendations', fetchRecommendations, setRecommendations),
      safeFetch('problems', fetchProblems, setProblems),
      safeFetch('trends', fetchTrends, setTrends),
      safeFetch('coverage', fetchCoverage, setCoverage),
      safeFetch('insights', fetchInsights, setInsights),
    ]);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleProcessNlp = async () => {
    setProcessing(true);
    try { await triggerNlpProcess(); await fetchAll(); }
    catch (e) { setError('Gagal memproses NLP: ' + e.message); }
    finally { setProcessing(false); }
  };

  const handleSearchEntities = async () => {
    try { const r = await fetchChatbotEntities(entitySearch); setEntityResults(r); }
    catch (e) { setEntityResults([]); }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery) return;
    try {
      const r = await semanticSearch(searchQuery, searchFilters);
      setSearchResults(r);
    } catch (e) { setSearchResults([]); }
  };

  const d = data || {}; const k = d.kpis || {};
  const kpiList = KPI_CONFIG.map(cfg => { const v = k[cfg.key] || {}; return { ...cfg, label: v.label || cfg.key, value: v.current ?? '—', sub: v.sub || '' }; });
  const isLoading = (id) => loading[id] !== undefined ? loading[id] : false;

  const TabButton = ({ tab, isActive }) => {
    const Icon = tab.icon;
    return (
      <button onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all min-h-[36px] ${isActive ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'}`}>
        <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{tab.label}</span>
      </button>
    );
  };

  const renderOverview = () => {
    const isEmpty = !kpiList.some(item => item.value !== '—' && item.value !== 0 && item.value !== '0');
    return (
      <>
        {insights && insights.length > 0 && (
          <div className="mb-6"><InsightPanel insights={insights} loading={isLoading('insights')} /></div>
        )}
        {isEmpty ? (
          <EmptyState title="Belum Ada Data Chatbot" desc="Klik 'Proses NLP' untuk memulai analisis." action={
            <button onClick={handleProcessNlp} disabled={processing} className="mt-3 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-xl text-xs font-bold hover:bg-primary/30 transition-all disabled:opacity-40">
              {processing ? 'Memproses...' : 'Proses NLP Sekarang'}
            </button>
          } />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {kpiList.map(cfg => (
              <KpiCard key={cfg.key} label={cfg.label} value={cfg.value} sub={cfg.sub} icon={cfg.icon} gradient={cfg.grad} iconColor={cfg.ic} />
            ))}
          </div>
        )}
      </>
    );
  };

  const renderActivity = () => {
    if (!activity) return <EmptyState title="Aktivitas" desc="Proses NLP terlebih dahulu." />;
    const dayData = activity.sessionsPerDay || []; const hourData = activity.sessionsPerHour || []; const heatmapData = activity.heatmap || [];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Sesi per Hari"><ResponsiveContainer width="100%" height={260}>
            <BarChart data={dayData.slice(-30)}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" />
              <Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Sesi" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Sesi per Jam"><ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" />
              <Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Sesi" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer></ChartCard>
        </div>
        <ChartCard title="Heatmap Aktivitas" subtitle="Pola hari vs jam">
          <div className="overflow-x-auto">
            <div className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(24,minmax(24px,1fr))' }}>
              <div className="text-[9px] font-bold text-muted" />{[...Array(24)].map((_, h) => <div key={h} className="text-[9px] font-bold text-muted text-center">{h}</div>)}
              {DAY_NAMES.map((day, di) => (
                <React.Fragment key={di}>
                  <div className="text-[9px] font-bold text-muted flex items-center">{day.slice(0, 3)}</div>
                  {[...Array(24)].map((_, hi) => {
                    const cell = heatmapData.find(h => h.day === di && h.hour === hi); const val = cell?.value || 0; const max = Math.max(...heatmapData.map(h => h.value), 1); return (
                      <div key={`${di}-${hi}`} className="rounded aspect-square" style={{ backgroundColor: `rgba(99,102,241,${Math.min(val / max, 1) * 0.8 + 0.05})` }} title={`${day},${hi}:00-${val} sesi`} />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </ChartCard>
        <ChartCard title="Timeline"><ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dayData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" />
            <Tooltip content={<CustomTooltip />} />
            <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
            <Area type="monotone" dataKey="count" name="Sesi" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer></ChartCard>
      </div>
    );
  };

  const renderTopics = () => {
    if (!topics) return <EmptyState title="Topik" desc="Proses NLP terlebih dahulu." />;
    const topicDist = topics.topicDistribution || []; const tfidfRanking = topics.tfidfRanking || [];
    const bigrams = topics.bigrams || []; const trigrams = topics.trigrams || []; const cooc = topics.cooccurrenceMatrix || [];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribusi Topik" subtitle={`${topicDist.length} topik`}>
            <ResponsiveContainer width="100%" height={280}><PieChart>
              <Pie data={topicDist} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ label, percent }) => `${label}(${(percent * 100).toFixed(0)}%)`}>
                {topicDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip content={<CustomTooltip />} />
            </PieChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Kata Kunci per Topik">
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {topicDist.slice(0, 5).map((t, ti) => (
                <div key={ti}><p className="text-[11px] font-bold text-foreground mb-1">{t.label}</p>
                  <div className="flex flex-wrap gap-1.5">{(t.words || []).slice(0, 8).map((w, wi) => <span key={wi} className="text-[10px] px-2 py-1 rounded-lg bg-foreground/5 text-muted font-medium">{w.word}</span>)}</div>
                </div>
              ))}
            </div></ChartCard>
        </div>
        <ChartCard title="TF-IDF"><ResponsiveContainer width="100%" height={Math.min(tfidfRanking.length * 20, 400)}>
          <BarChart data={tfidfRanking.slice(0, 30)} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis type="category" dataKey="term" tick={{ fontSize: 10 }} stroke="var(--muted)" width={90} />
            <Tooltip content={<CustomTooltip />} /><Bar dataKey="score" name="TF-IDF" fill="#a855f7" radius={[0, 4, 4, 0]} />
          </BarChart></ResponsiveContainer></ChartCard>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Bigram">{bigrams.slice(0, 15).map((b, i) => (<div key={i} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0"><span className="text-xs">{b.bigram.replace(/_/g, ' ')}</span><span className="text-[10px] font-bold text-primary">{b.count}x</span></div>))}</ChartCard>
          <ChartCard title="Trigram">{trigrams.slice(0, 15).map((t, i) => (<div key={i} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0"><span className="text-xs">{t.trigram.replace(/_/g, ' ')}</span><span className="text-[10px] font-bold text-primary">{t.count}x</span></div>))}</ChartCard>
          <ChartCard title="Ko-okurensi">{cooc.slice(0, 15).map((c, i) => (<div key={i} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0"><span className="text-xs">{c.word1} — {c.word2}</span><span className="text-[10px] font-bold text-primary">{c.count}x</span></div>))}</ChartCard>
        </div>
      </div>
    );
  };

  const renderCommodities = () => {
    if (!ner) return <EmptyState title="Komoditas" desc="Proses NLP terlebih dahulu." />;
    const commodities = ner.commodities || [];
    return (
      <div className="space-y-6">
        <ChartCard title="Distribusi Komoditas"><ResponsiveContainer width="100%" height={Math.max(commodities.length * 30, 300)}>
          <BarChart data={commodities.slice(0, 20)} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis type="category" dataKey="value" tick={{ fontSize: 10 }} stroke="var(--muted)" width={90} />
            <Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Sebutan" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Treemap"><ResponsiveContainer width="100%" height={350}><Treemap data={commodities.slice(0, 30)} dataKey="count" aspectRatio={4 / 3} stroke="var(--background)" fill="#f59e0b"><Tooltip content={<CustomTooltip />} /></Treemap></ResponsiveContainer></ChartCard>
      </div>
    );
  };

  const renderLocation = () => {
    if (!ner) return <EmptyState title="Lokasi" desc="Proses NLP terlebih dahulu." />;
    const locations = ner.locations || [];
    return (
      <div className="space-y-6">
        <ChartCard title="Peringkat Lokasi"><ResponsiveContainer width="100%" height={Math.max(locations.length * 30, 300)}>
          <BarChart data={locations.slice(0, 20)} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis type="category" dataKey="value" tick={{ fontSize: 10 }} stroke="var(--muted)" width={90} />
            <Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Sebutan" fill="#14b8a6" radius={[0, 4, 4, 0]} />
          </BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Daftar Lokasi">
          <div className="max-h-80 overflow-y-auto"><table className="w-full text-xs"><thead><tr className="text-muted font-bold uppercase tracking-wider"><th className="text-left py-2">Lokasi</th><th className="text-right py-2">Sebutan</th></tr></thead><tbody>
            {locations.map((l, i) => <tr key={i} className="border-t border-border/20"><td className="py-2 font-medium text-foreground">{l.value}</td><td className="py-2 text-right font-bold text-primary">{l.count}</td></tr>)}
          </tbody></table></div></ChartCard>
      </div>
    );
  };

  const renderIntent = () => {
    if (!intent) return <EmptyState title="Intent" desc="Proses NLP terlebih dahulu." />;
    const intentDist = intent.intentDistribution || []; const sentDist = intent.sentimentDistribution || []; const emotionDist = intent.emotionDistribution || [];
    const keywordRanking = intent.keywordRanking || []; const words = intent.wordClouds || {};
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribusi Intent"><ResponsiveContainer width="100%" height={280}><PieChart>
            <Pie data={intentDist} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={({ _id, percent }) => `${_id}(${(percent * 100).toFixed(0)}%)`}>
              {intentDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} />
          </PieChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Distribusi Sentimen"><ResponsiveContainer width="100%" height={280}><PieChart>
            <Pie data={sentDist.map(s => ({ ...s, name: s._id }))} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name}(${(percent * 100).toFixed(0)}%)`}>
              {sentDist.map(s => <Cell key={s._id} fill={SENTIMENT_COLORS[s._id] || '#6b7280'} />)}</Pie><Tooltip content={<CustomTooltip />} />
          </PieChart></ResponsiveContainer></ChartCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribusi Emosi"><ResponsiveContainer width="100%" height={240}>
            <BarChart data={emotionDist.map(e => ({ name: e._id, value: e.count }))} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted)" width={70} />
              <Tooltip content={<CustomTooltip />} /><Bar dataKey="value" name="Kemunculan" fill="#d946ef" radius={[0, 4, 4, 0]} />
            </BarChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Timeline Sentimen"><ResponsiveContainer width="100%" height={240}>
            <LineChart data={(intent.sentimentTimeline || []).slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" domain={[-1, 1]} />
              <Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="avgSentiment" name="Skor" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart></ResponsiveContainer></ChartCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[{ key: 'positive', label: 'Positif', c: 'emerald' }, { key: 'neutral', label: 'Netral', c: 'gray' }, { key: 'negative', label: 'Negatif', c: 'red' }].map(({ key, label, c }) => (
            <ChartCard key={key} title={`Kata ${label}`} subtitle="Word Cloud">
              <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
                {(words[key] || []).slice(0, 30).map((w, i) => <span key={i} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${c === 'emerald' ? 'rgba(16,185,129,0.1)' : c === 'gray' ? 'rgba(107,114,128,0.1)' : 'rgba(239,68,68,0.1)'}`, color: `${c === 'emerald' ? '#10b981' : c === 'gray' ? '#9ca3af' : '#ef4444'}`, fontSize: `${Math.min(14, 8 + w.weight * 0.5)}px` }}>{w.word}</span>)}
              </div></ChartCard>
          ))}
        </div>
        <ChartCard title="Peringkat Kata Kunci">
          <div className="max-h-80 overflow-y-auto"><table className="w-full text-xs"><thead><tr className="text-muted font-bold uppercase tracking-wider"><th className="text-left py-2">Kata</th><th className="text-right py-2">Frekuensi</th><th className="text-right py-2">Dokumen</th></tr></thead><tbody>
            {(keywordRanking || []).slice(0, 50).map((kw, i) => <tr key={i} className="border-t border-border/20"><td className="py-1.5 font-medium text-foreground">{kw.word}</td><td className="py-1.5 text-right font-bold text-primary">{kw.frequency}</td><td className="py-1.5 text-right text-muted">{kw.documentCount}</td></tr>)}
          </tbody></table></div></ChartCard>
      </div>
    );
  };

  const renderEntities = () => {
    if (!entities) return <EmptyState title="Entitas" desc="Proses NLP terlebih dahulu." />;
    const entityFreq = entities.entityFrequency || []; const typeDist = entities.entityTypeDistribution || [];
    return (
      <div className="space-y-6">
        <ChartCard title="Pencarian Entitas" subtitle="Cari berdasarkan nama">
          <div className="flex gap-2 mb-4">
            <input type="text" value={entitySearch} onChange={e => setEntitySearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchEntities()} placeholder="Ketik nama..." className="flex-1 bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-2 text-xs font-bold outline-none placeholder:text-muted/40" />
            <button onClick={handleSearchEntities} className="px-3 py-2 bg-primary/20 border border-primary/30 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all"><Search className="w-3.5 h-3.5" /></button>
          </div>
          {entityResults && (
            <div className="max-h-40 overflow-y-auto mb-4">
              {entityResults.length === 0 ? (
                <p className="text-muted text-xs">Tidak ada hasil.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted font-bold uppercase tracking-wider">
                      <th className="text-left py-1">Entitas</th>
                      <th className="text-left py-1">Tipe</th>
                      <th className="text-right py-1">Sesi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entityResults.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-border/20">
                        <td className="py-1 font-medium text-foreground">{r.entity.value}</td>
                        <td className="py-1 text-muted">{r.entity.type}</td>
                        <td className="py-1 text-right text-[10px] text-muted">{r.session_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </ChartCard>
        <ChartCard title="Distribusi Tipe Entitas"><ResponsiveContainer width="100%" height={280}>
          <BarChart data={typeDist.map(e => ({ name: e._id, count: e.count, total: e.totalOccurrences }))} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted)" width={110} />
            <Tooltip content={<CustomTooltip />} /><Bar dataKey="total" name="Kemunculan" fill="#818cf8" radius={[0, 4, 4, 0]} />
          </BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Frekuensi Entitas"><div className="max-h-80 overflow-y-auto"><table className="w-full text-xs"><thead><tr className="text-muted font-bold uppercase tracking-wider"><th className="text-left py-2">Entitas</th><th className="text-left py-2">Tipe</th><th className="text-right py-2">Frekuensi</th></tr></thead><tbody>
          {entityFreq.slice(0, 50).map((e, i) => <tr key={i} className="border-t border-border/20"><td className="py-1.5 font-medium text-foreground">{e._id.value}</td><td className="py-1.5 text-muted">{e._id.type}</td><td className="py-1.5 text-right font-bold text-primary">{e.count}</td></tr>)}
        </tbody></table></div></ChartCard>
      </div>
    );
  };

  const renderSemantic = () => {
    if (!semantic) return <EmptyState title="Jaringan Semantik" desc="Proses NLP terlebih dahulu." />;
    const relations = semantic.relations || []; const entityFreq = semantic.entityFrequency || [];
    return (
      <div className="space-y-6">
        <ChartCard title="Jaringan Relasi" subtitle={`${semantic.totalRelations} relasi dari ${semantic.totalSentences} kalimat`}>
          <div className="max-h-96 overflow-y-auto"><table className="w-full text-xs"><thead><tr className="text-muted font-bold uppercase tracking-wider"><th className="text-left py-2">Sumber</th><th className="text-left py-2">Relasi</th><th className="text-left py-2">Target</th><th className="text-right py-2">Kekuatan</th></tr></thead><tbody>
            {relations.slice(0, 100).map((r, i) => <tr key={i} className="border-t border-border/20"><td className="py-1.5 font-bold text-foreground">{r.source}</td><td className="py-1.5"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{r.label}</span></td><td className="py-1.5 font-bold text-foreground">{r.target}</td><td className="py-1.5 text-right font-bold text-muted">{r.count}</td></tr>)}
          </tbody></table></div></ChartCard>
        <ChartCard title="Frekuensi Entitas dalam Relasi">
          <ResponsiveContainer width="100%" height={Math.max(entityFreq.length * 30, 300)}>
            <BarChart data={entityFreq.slice(0, 20)} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis type="category" dataKey="value" tick={{ fontSize: 10 }} stroke="var(--muted)" width={90} />
              <Tooltip content={<CustomTooltip />} /><Bar dataKey="count" name="Relasi" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart></ResponsiveContainer></ChartCard>
      </div>
    );
  };

  const renderGraph = () => {
    if (isLoading('knowledge')) return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
    return <KnowledgeGraph data={knowledge} height={550} />;
  };

  const renderRecommendations = () => {
    if (!recommendations) return <EmptyState title="Rekomendasi" desc="Proses NLP terlebih dahulu." />;
    const recs = recommendations.recommendations || []; const cats = recommendations.categoryDistribution || [];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={`${recommendations.total} Rekomendasi Ditemukan`} subtitle="Berdasarkan analisis NLP">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={cats} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category}(${(percent * 100).toFixed(0)}%)`}>
                {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} />
              </PieChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Kategori Rekomendasi">
            <div className="space-y-2">{cats.map((c, i) => (<div key={i} className="flex items-center justify-between"><span className="text-xs font-medium text-foreground">{c.category}</span><div className="flex items-center gap-2"><div className="h-2 rounded-full" style={{ width: `${Math.max(20, c.count * 20)}px`, backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-[10px] font-bold text-muted">{c.count}</span></div></div>))}</div></ChartCard>
        </div>
        <ChartCard title="Daftar Rekomendasi">
          <div className="max-h-96 overflow-y-auto space-y-2">
            {recs.slice(0, 50).map((r, i) => (<div key={i} className="p-3 bg-background/40 rounded-xl border border-border/20">
              <p className="text-xs font-bold text-foreground">{r.insight}</p>
              <div className="flex items-center gap-2 mt-1.5"><span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{r.category}</span><span className="text-[10px] text-muted">Skor: {r.relevance_score}</span></div>
            </div>))}
          </div></ChartCard>
      </div>
    );
  };

  const renderProblems = () => {
    if (!problems) return <EmptyState title="Masalah" desc="Proses NLP terlebih dahulu." />;
    const probs = problems.problems || []; const typeDist = problems.typeDistribution || []; const topProbs = problems.topProblems || [];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribusi Tipe Masalah"><ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={typeDist} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, percent }) => `${type}(${(percent * 100).toFixed(0)}%)`}>
              {typeDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} />
            </PieChart></ResponsiveContainer></ChartCard>
          <ChartCard title="10 Masalah Teratas" subtitle="Berdasarkan tingkat keparahan">
            <div className="space-y-1.5">{topProbs.slice(0, 10).map((p, i) => (<div key={i} className="flex items-center justify-between py-1 border-b border-border/10"><span className="text-[10px] font-medium text-foreground truncate max-w-[200px]">{p.insight}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: SEVERITY_COLORS[p.severity] + '20', color: SEVERITY_COLORS[p.severity] }}>{p.severity}/10</span></div>))}</div></ChartCard>
        </div>
        <ChartCard title="Timeline Masalah">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(problems.timeline || [])}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" />
              <Tooltip content={<CustomTooltip />} /><Bar dataKey="total" name="Masalah" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Semua Masalah (by Severity)">
          <div className="max-h-80 overflow-y-auto space-y-1">
            {probs.slice(0, 100).map((p, i) => (<div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/10"><span className="text-[10px] w-16 font-bold" style={{ color: SEVERITY_COLORS[p.severity] }}>{p.severity}/10</span><span className="text-[10px] px-1.5 py-0.5 rounded bg-background/40 text-muted font-medium">{p.type}</span><span className="text-[10px] text-foreground truncate">{p.insight}</span></div>))}
          </div></ChartCard>
      </div>
    );
  };

  const renderTrends = () => {
    if (!trends) return <EmptyState title="Tren" desc="Proses NLP terlebih dahulu." />;
    const topicTrend = trends.topicTrends || []; const commodityTrend = trends.commodityTrends || [];
    const intentTrend = trends.intentTrends || []; const overall = trends.overall;
    return (
      <div className="space-y-6">
        {overall && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ l: 'Total Sesi', v: overall.total }, { l: 'Perubahan', v: `${overall.growth?.percentChange || 0}%` }, { l: 'Arah', v: overall.growth?.direction || '-' }, { l: 'Periode', v: overall.dateRange ? `${overall.dateRange.start} - ${overall.dateRange.end}` : '-' }].map((s, i) => (
            <div key={i} className="bg-surface/30 rounded-xl border border-border/20 p-4 text-center"><p className="text-lg font-black text-foreground">{s.v}</p><p className="text-[10px] text-muted font-bold uppercase mt-1">{s.l}</p></div>
          ))}
        </div>}
        <ChartCard title="Tren Topik" subtitle="Perubahan distribusi topik per hari">
          <div className="overflow-x-auto"><div className="min-w-[600px]">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topicTrend.map(t => ({ date: t.date, ...t.values }))}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(topicTrend[0]?.values || {}).slice(0, 5).map((key, i) => <Bar key={key} dataKey={key} name={key} fill={COLORS[i % COLORS.length]} stackId="a" />)}
              </BarChart></ResponsiveContainer></div></div></ChartCard>
        <ChartCard title="Tren Komoditas" subtitle="Per frekuensi kemunculan">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={commodityTrend.map(t => ({ date: t.date, ...t.values }))}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" />
              <Tooltip content={<CustomTooltip />} />
              {Object.keys(commodityTrend[0]?.values || {}).slice(0, 5).map((key, i) => <Bar key={key} dataKey={key} name={key} fill={COLORS[i % COLORS.length]} stackId="a" />)}
            </BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Tren Intent"><ResponsiveContainer width="100%" height={250}>
          <BarChart data={intentTrend.map(t => ({ date: t.date, ...t.values }))}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted)" /><YAxis tick={{ fontSize: 10 }} stroke="var(--muted)" />
            <Tooltip content={<CustomTooltip />} />
            {Object.keys(intentTrend[0]?.values || {}).slice(0, 5).map((key, i) => <Bar key={key} dataKey={key} name={key} fill={COLORS[i % COLORS.length]} stackId="a" />)}
          </BarChart></ResponsiveContainer></ChartCard>
      </div>
    );
  };

  const renderCoverage = () => {
    if (!coverage) return <EmptyState title="Cakupan" desc="Proses NLP terlebih dahulu." />;
    const scores = coverage.scores || {}; const radarData = Object.entries(scores).map(([key, val]) => ({ subject: key.replace(/([A-Z])/g, ' $1').trim(), value: Math.round(val * 100) }));
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(scores).map(([key, val], i) => (<div key={i} className="bg-surface/30 rounded-xl border border-border/20 p-4 text-center">
            <p className="text-2xl font-black" style={{ color: val > 0.7 ? '#10b981' : val > 0.4 ? '#f59e0b' : '#ef4444' }}>{Math.round(val * 100)}%</p>
            <p className="text-[10px] text-muted font-bold uppercase mt-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
          </div>))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Radar Coverage"><ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}><PolarGrid stroke="var(--border)" opacity={0.3} /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted)' }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <Radar name="Coverage" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Rekomendasi"><div className="space-y-2">{(coverage.recommendations || []).map((r, i) => (<div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-background/30"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" /><p className="text-[11px] text-muted">{r}</p></div>))}
            {(coverage.recommendations || []).length === 0 && <p className="text-xs text-muted">Semua metrik coverage dalam kondisi baik.</p>}</div></ChartCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coverage.topicCoverage && <ChartCard title="Cakupan Topik"><div className="flex items-center gap-4"><div className="flex-1"><div className="h-3 rounded-full bg-background/60 overflow-hidden"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${(coverage.topicCoverage.covered / coverage.topicCoverage.total) * 100}%` }} /></div></div><span className="text-xs font-bold text-foreground">{coverage.topicCoverage.covered}/{coverage.topicCoverage.total}</span></div>
            <div className="mt-2 flex flex-wrap gap-1">{coverage.topicCoverage.categories?.map((c, i) => <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/5 text-muted">{c}</span>)}</div></ChartCard>}
          {coverage.commodityCoverage && <ChartCard title="Cakupan Komoditas"><div className="flex items-center gap-4"><div className="flex-1"><div className="h-3 rounded-full bg-background/60 overflow-hidden"><div className="h-full rounded-full bg-amber-500" style={{ width: `${(coverage.commodityCoverage.covered / coverage.commodityCoverage.total) * 100}%` }} /></div></div><span className="text-xs font-bold text-foreground">{coverage.commodityCoverage.covered}/{coverage.commodityCoverage.total}</span></div>
            <div className="mt-2 flex flex-wrap gap-1">{coverage.commodityCoverage.commodities?.slice(0, 10).map((c, i) => <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/5 text-muted">{c}</span>)}</div></ChartCard>}
        </div>
      </div>
    );
  };

  const renderSearch = () => {
    return (
      <div className="space-y-6">
        <ChartCard title="Pencarian Semantik" subtitle="Cari berdasarkan kata kunci, intent, kategori">
          <div className="flex gap-2 mb-4">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSemanticSearch()}
              placeholder="Ketik kata kunci pencarian..." className="flex-1 bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-2 text-xs font-bold outline-none placeholder:text-muted/40" />
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            <select value={searchFilters.type} onChange={e => setSearchFilters(p => ({ ...p, type: e.target.value }))} className="bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none cursor-pointer">
              <option value="">Semua Tipe</option><option value="Komoditas">Komoditas</option><option value="Provinsi">Provinsi</option><option value="Cuaca">Cuaca</option>
            </select>
            <select value={searchFilters.intent} onChange={e => setSearchFilters(p => ({ ...p, intent: e.target.value }))} className="bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none cursor-pointer">
              <option value="">Semua Intent</option><option value="Informasi">Informasi</option><option value="Rekomendasi">Rekomendasi</option><option value="Permasalahan">Permasalahan</option><option value="Harga">Harga</option>
            </select>
            <button onClick={handleSemanticSearch} className="px-4 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">Cari</button>
          </div>
          {searchResults && (
            <div className="max-h-[500px] overflow-y-auto">
              {searchResults.length === 0 ? <p className="text-muted text-xs">Tidak ada hasil untuk "{searchQuery}".</p> : (
                <table className="w-full text-xs"><thead><tr className="text-muted font-bold uppercase tracking-wider"><th className="text-left py-2">Skor</th><th className="text-left py-2">Konten</th><th className="text-left py-2">Intent</th><th className="text-right py-2">Sesi</th></tr></thead><tbody>
                  {searchResults.map((r, i) => <tr key={i} className="border-t border-border/20"><td className="py-2"><span className="text-[10px] font-bold text-primary">{r.score?.toFixed(3) || '-'}</span></td><td className="py-2"><p className="text-[10px] text-foreground max-w-xs truncate">{r.snippet || r.text?.slice(0, 100)}</p></td><td className="py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 text-muted">{r.intent || '-'}</span></td><td className="py-2 text-right text-[9px] text-muted">{r.session_id || '-'}</td></tr>)}
                </tbody></table>
              )}
            </div>
          )}
        </ChartCard>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading.overview && activeTab === 'overview') {
      return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-36 bg-foreground/5 rounded-3xl animate-pulse" />)}</div>;
    }
    if (error && activeTab === 'overview') return <ErrorState title="Gagal Memuat" message={error} onRetry={fetchAll} />;
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'activity': return renderActivity();
      case 'topics': return renderTopics();
      case 'commodities': return renderCommodities();
      case 'location': return renderLocation();
      case 'intent': case 'sentiment': return renderIntent();
      case 'entities': return renderEntities();
      case 'semantic': return renderSemantic();
      case 'graph': return renderGraph();
      case 'recommend': return renderRecommendations();
      case 'problems': return renderProblems();
      case 'trends': return renderTrends();
      case 'coverage': return renderCoverage();
      case 'search': return renderSearch();
      default: return renderOverview();
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in chatbot-dashboard-content">
      <nav className="flex items-center gap-1.5 text-xs font-medium text-muted/50"><Home className="w-3 h-3" /><span>Beranda</span><ChevronRight className="w-3 h-3" /><span className="text-foreground/70 font-semibold">Chatbot Insight</span></nav>

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-violet-400 to-violet-600 rounded-full" />
            <div><h1 className="text-3xl font-black text-foreground tracking-tight">Chatbot Insight</h1><p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Enterprise AI Analytics</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleProcessNlp} disabled={processing} className="flex items-center gap-2 px-3 py-2 bg-primary/20 border border-primary/30 text-primary rounded-xl text-xs font-bold hover:bg-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"><Zap className={`w-3.5 h-3.5 ${processing ? 'animate-pulse' : ''}`} />{processing ? 'Memproses...' : 'Proses NLP'}</button>
            <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 bg-background/60 border border-border/50 text-foreground rounded-xl text-xs font-bold hover:bg-background/80 transition-all min-h-[44px]"><RefreshCw className={`w-3.5 h-3.5 ${loading.overview ? 'animate-spin' : ''}`} />{loading.overview ? 'Memuat...' : 'Refresh'}</button>
          </div>
        </div>


      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(tab => <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} />)}
      </div>

      <DashboardSection title={TABS.find(t => t.id === activeTab)?.label || ''} subtitle={`Analisis ${TABS.find(t => t.id === activeTab)?.label?.toLowerCase() || ''}`} accent="from-violet-400 to-violet-600">
        {renderTabContent()}
      </DashboardSection>

      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} data={kpiList} title="chatbot-insight-dashboard" />
    </div>
  );
};

export default ChatbotInsightDashboard;
