import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Tractor, Building2, Database, ChevronDown, BarChart3, Leaf, Users, UserCheck,
  DollarSign, Layers, Grid3X3, Sprout, Activity, Settings, MessageSquare,
  Wheat, Flower2, Wrench, ShoppingBasket, ShieldCheck, Ruler, Package, Beaker, Pill,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL as BASE_URL } from '../../services/authService';

// ── Static content definitions (exact 10-item target structure) ──────────────

// Item 3 — Government Data (13 catalogs, exact labels & order)
const GOVERNMENT_DATA_ITEMS = [
  { name: 'CadanganPanganProvinsi', path: '/data/cadangan-pangan-provinsi' },
  { name: 'GerakanPanganMurah', path: '/data/gerakan-pangan-murah' },
  { name: 'HargaKonsumenNasional', path: '/data/harga-konsumen-nasional' },
  { name: 'HargaKonsumenProvinsi', path: '/data/harga-konsumen-provinsi' },
  { name: 'HargaProdusenNasional', path: '/data/harga-produsen-nasional' },
  { name: 'HargaProdusenProvinsi', path: '/data/harga-produsen-provinsi' },
  { name: 'KetidakcukupanNasional', path: '/data/ketidakcukupan-nasional' },
  { name: 'KetidakcukupanProvinsi', path: '/data/ketidakcukupan-provinsi' },
  { name: 'KonsumsiPerJenis', path: '/data/konsumsi-per-jenis' },
  { name: 'PanganTerselamatkan', path: '/data/pangan-terselamatkan' },
  { name: 'PenyaluranDonasi', path: '/data/penyaluran-donasi' },
  { name: 'ProyeksiNeraca', path: '/data/proyeksi-neraca' },
  { name: 'SkorPPH', path: '/data/skor-pph' },
];

// Item 5 — Master Data children (Farm is superadmin-only inside an Owner-visible section)
const MASTER_DATA_ITEMS = [
  { name: 'Farm', path: '/master/farms', superadminOnly: true, icon: <Layers className="w-4 h-4" /> },
  { name: 'Block', path: '/master/blocks', icon: <Grid3X3 className="w-4 h-4" /> },
  { name: 'Jenis Tanaman', path: '/master/crop-types', icon: <Sprout className="w-4 h-4" /> },
  { name: 'Jenis Aktivitas', path: '/master/activity-types', icon: <Activity className="w-4 h-4" /> },
  { name: 'Satuan', path: '/master/units', icon: <Ruler className="w-4 h-4" /> },
  { name: 'Varietas', path: '/master/crop-varieties', icon: <Package className="w-4 h-4" /> },
  { name: 'Pupuk', path: '/master/fertilizers', icon: <Beaker className="w-4 h-4" /> },
  { name: 'Nutrisi', path: '/master/nutrients', icon: <Beaker className="w-4 h-4" /> },
  { name: 'Obat', path: '/master/medicines', icon: <Pill className="w-4 h-4" /> },
];

// Item 7 — Lifecycle stages
const LIFECYCLE_ITEMS = [
  { name: 'Persiapan Lahan', stage: 'Land_Preparation', path: '/management/lifecycle/persiapan-lahan', icon: <Wheat className="w-4 h-4" /> },
  { name: 'Penanaman', stage: 'Planting', path: '/management/lifecycle/penanaman', icon: <Flower2 className="w-4 h-4" /> },
  { name: 'Perawatan', stage: 'Maintenance', path: '/management/lifecycle/perawatan', icon: <Wrench className="w-4 h-4" /> },
  { name: 'Panen', stage: 'Harvesting', path: '/management/lifecycle/panen', icon: <ShoppingBasket className="w-4 h-4" /> },
];

const Sidebar = ({ isOpen, user, onToggle }) => {
  const [openGovData, setOpenGovData] = useState(false);
  const [openMaster, setOpenMaster] = useState(false);
  const [openLifecycle, setOpenLifecycle] = useState(false);
  const [openKelolaUser, setOpenKelolaUser] = useState(false);
  const [farmerStages, setFarmerStages] = useState([]);
  const [farmerSalesAccess, setFarmerSalesAccess] = useState(false);
  const location = useLocation();
  const { token } = useAuth();

  const isDataActive = location.pathname.startsWith('/data');
  const isMgmtActive = location.pathname.startsWith('/management');
  const isMasterActive = location.pathname.startsWith('/master');
  const isLifecycleActive = location.pathname.startsWith('/management/lifecycle');
  const isKelolaUserActive = location.pathname.startsWith('/management/um') || location.pathname.startsWith('/management/farmers');

  // Petani per-stage visibility — source of truth: backend farmer-assignments
  useEffect(() => {
    if (user?.role === 'farmer' && token) {
      fetch(`${BASE_URL}/assignments/farmer-assignments`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(j => {
          if (j.success) {
            const assignments = j.data || [];
            // empty access_stages = full access to all stages
            const hasFull = assignments.some(a => !a.access_stages || a.access_stages.length === 0);
            setFarmerStages(hasFull ? ['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting'] : [...new Set(assignments.flatMap(a => a.access_stages || []))]);
            setFarmerSalesAccess(assignments.some(a => a.sales_access));
          }
        })
        .catch(() => {});
    }
  }, [user?.role, token]);

  const isSuperadmin = user?.role === 'superadmin';
  const isGovernment = user?.role === 'government';
  const isOwner = user?.role === 'farmer_owner';
  const isFarmer = user?.role === 'farmer';

  // ── Per-item role gates (superadmin sees everything) ──
  // 1. Government Dashboard — Pemerintah (+ superadmin)
  const showGovDashboard = isGovernment || isSuperadmin;
  // 2. Chatbot Insight — Pemerintah (+ superadmin)
  const showChatbot = isGovernment || isSuperadmin;
  // 3. Government Data — Pemerintah (+ superadmin)
  const showGovData = isGovernment || isSuperadmin;
  // 4. Farmer Dashboard — Owner (+ superadmin). NOT Petani.
  const showFarmerDash = isOwner || isSuperadmin;
  // 5. Master Data — Owner (+ superadmin); Farm child superadmin-only
  const showMasterData = isOwner || isSuperadmin;
  // 6. Analitik & KPI Dashboard — Owner (+ superadmin)
  const showAnalitik = isOwner || isSuperadmin;
  // 7. Management Siklus Pertanian — Owner/superadmin unconditional; Petani per penugasan
  const showLifecycle = (isOwner || isSuperadmin) || (isFarmer && farmerStages.length > 0);
  const visibleLifecycleItems = (isOwner || isSuperadmin)
    ? LIFECYCLE_ITEMS
    : LIFECYCLE_ITEMS.filter(s => farmerStages.includes(s.stage));
  // 8. Penjualan dan Distribusi — Owner/superadmin unconditional; Petani via penugasan sales_access
  const showPenjualan = (isOwner || isSuperadmin) || (isFarmer && farmerSalesAccess);
  // 9. Kelola User
  //    a. Penugasan — Owner (+ superadmin). NOT Pemerintah.
  const showPenugasan = isOwner || isSuperadmin;
  //    b. User Manajemen — Owner dan Pemerintah (+ superadmin)
  const showUserManajemen = isOwner || isGovernment || isSuperadmin;

  const navItemCls = ({ isActive }) =>
    `group flex items-center gap-4 px-6 py-4 min-h-[52px] rounded-[1.5rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative ${isActive ? 'bg-primary text-white shadow-2xl shadow-primary/30 translate-x-1.5' : 'text-muted hover:bg-primary/5 hover:text-primary hover:translate-x-1'}`;
  const sectionBtnCls = (active) =>
    `w-full group flex items-center justify-between px-6 py-4 min-h-[52px] rounded-[1.5rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${active ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-primary/5 hover:text-primary hover:translate-x-1'}`;
  const childLinkCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-[11px] font-bold transition-all duration-300 leading-snug ${isActive ? 'bg-primary/10 text-primary translate-x-1' : 'text-muted hover:text-primary hover:bg-primary/5 hover:translate-x-1'}`;

  return (
    <>
      <div onClick={onToggle} className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-500 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'w-80 p-4 translate-x-0 lg:relative' : 'w-0 p-0 -translate-x-full lg:w-80 lg:p-4 lg:fixed overflow-hidden'}`}>
        <div className={`h-full bg-surface/80 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${!isOpen ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}>
          <div className="w-72 flex flex-col h-full flex-shrink-0">
            <div className="h-20 flex items-center px-8 border-b border-border/30 flex-shrink-0">
              <h1 className="text-xl font-black tracking-tighter flex items-center gap-2.5">
                <img
                  src="/images/sugi-logo.png"
                  alt="SUGI"
                  className="w-9 h-9 object-contain transition-transform duration-500 hover:rotate-12"
                />
                <div className="flex flex-col leading-none">
                  <span className="text-primary text-lg font-black italic">SUGI</span>
                  <span className="text-foreground/40 text-[10px] uppercase tracking-[0.2em] font-black">Dashboard</span>
                </div>
              </h1>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-2 mt-4 relative overflow-y-auto custom-scrollbar">
              <p className="px-5 text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-4 opacity-40">Main Menu</p>

              {/* 1. Government Dashboard */}
              {showGovDashboard && (
                <NavLink to="/government" className={navItemCls}>
                  <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"><Building2 className="w-5 h-5" /></div>
                  <span className="text-[13px] font-black tracking-tight">Government Dashboard</span>
                </NavLink>
              )}

              {/* 2. Chatbot Insight */}
              {showChatbot && (
                <NavLink to="/chatbot-insight" className={navItemCls}>
                  <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"><MessageSquare className="w-5 h-5" /></div>
                  <span className="text-[13px] font-black tracking-tight">Chatbot Insight</span>
                </NavLink>
              )}

              {/* 3. Government Data + 13-catalog submenu */}
              {showGovData && (
                <div className="mt-2">
                  <button onClick={() => setOpenGovData(!openGovData)} className={sectionBtnCls(isDataActive)}>
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${isDataActive ? 'scale-110' : ''}`}><Database className="w-5 h-5" /></div>
                      <span className="text-[13px] font-black tracking-tight text-left">Government Data</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-300 ${openGovData ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${openGovData ? 'max-h-[1200px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-border/40 ml-8 py-2">
                      {GOVERNMENT_DATA_ITEMS.map(link => (
                        <NavLink key={link.path} to={link.path} className={childLinkCls} title={link.name}>
                          <Database className="w-3.5 h-3.5 opacity-60" />
                          <span>{link.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Farmer Dashboard */}
              {showFarmerDash && (
                <NavLink to="/farmer" className={navItemCls}>
                  <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"><Tractor className="w-5 h-5" /></div>
                  <span className="text-[13px] font-black tracking-tight">Farmer Dashboard</span>
                </NavLink>
              )}

              {/* 5. Master Data + submenu (Farm superadmin-only) */}
              {showMasterData && (
                <div className="mt-2">
                  <button onClick={() => setOpenMaster(!openMaster)} className={sectionBtnCls(isMasterActive)}>
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${isMasterActive ? 'scale-110' : ''}`}><Layers className="w-5 h-5" /></div>
                      <span className="text-[13px] font-black tracking-tight text-left">Master Data</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-300 ${openMaster ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${openMaster ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-border/40 ml-8 py-2">
                      {MASTER_DATA_ITEMS.filter(i => !i.superadminOnly || isSuperadmin).map(link => (
                        <NavLink key={link.path} to={link.path} className={childLinkCls}>
                          {link.icon}
                          <span>{link.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Analitik & KPI Dashboard */}
              {showAnalitik && (
                <NavLink to="/management" end className={navItemCls}>
                  <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"><BarChart3 className="w-5 h-5" /></div>
                  <span className="text-[13px] font-black tracking-tight">Analitik & KPI Dashboard</span>
                </NavLink>
              )}

              {/* 7. Management Siklus Pertanian + per-stage submenu */}
              {showLifecycle && (
                <div className="mt-2">
                  <button onClick={() => setOpenLifecycle(!openLifecycle)} className={sectionBtnCls(isLifecycleActive)}>
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${isLifecycleActive ? 'scale-110' : ''}`}><Leaf className="w-5 h-5" /></div>
                      <span className="text-[13px] font-black tracking-tight text-left">Management Siklus Pertanian</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-300 ${openLifecycle ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${openLifecycle ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-border/40 ml-8 py-2">
                      {visibleLifecycleItems.map(s => (
                        <NavLink key={s.path} to={s.path} className={childLinkCls}>
                          {s.icon}
                          <span>{s.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Penjualan dan Distribusi */}
              {showPenjualan && (
                <NavLink to="/management/sales" className={navItemCls}>
                  <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"><DollarSign className="w-5 h-5" /></div>
                  <span className="text-[13px] font-black tracking-tight">Penjualan dan Distribusi</span>
                </NavLink>
              )}

              {/* 9. Kelola User + submenu */}
              {(showPenugasan || showUserManajemen) && (
                <div className="mt-2">
                  <button onClick={() => setOpenKelolaUser(!openKelolaUser)} className={sectionBtnCls(isKelolaUserActive)}>
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${isKelolaUserActive ? 'scale-110' : ''}`}><ShieldCheck className="w-5 h-5" /></div>
                      <span className="text-[13px] font-black tracking-tight text-left">Kelola User</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-300 ${openKelolaUser ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${openKelolaUser ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-border/40 ml-8 py-2">
                      {/* a. Penugasan (renamed from Unit Manajemen (UM)) — Owner only */}
                      {showPenugasan && (
                        <NavLink to="/management/um" className={childLinkCls}>
                          <Users className="w-3.5 h-3.5 opacity-60" />
                          <span>Penugasan</span>
                        </NavLink>
                      )}
                      {/* b. User Manajemen (renamed from Petani & Pengguna) — Owner dan Pemerintah */}
                      {showUserManajemen && (
                        <NavLink to="/management/farmers" className={childLinkCls}>
                          <UserCheck className="w-3.5 h-3.5 opacity-60" />
                          <span>User Manajemen</span>
                        </NavLink>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 10. Pengaturan */}
              <NavLink to="/settings" className={({ isActive }) =>
                `group flex items-center gap-4 px-6 py-4 min-h-[52px] rounded-[1.5rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative mt-2 ${isActive ? 'bg-primary text-white shadow-2xl shadow-primary/30 translate-x-1.5' : 'text-muted hover:bg-primary/5 hover:text-primary hover:translate-x-1'}`}>
                <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"><Settings className="w-5 h-5" /></div>
                <span className="text-[13px] font-black tracking-tight">Pengaturan</span>
              </NavLink>
            </nav>

            {user && (
              <div className="p-6 mt-auto">
                <div className="p-5 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col gap-2 group/status cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold text-sm uppercase">
                      {user.name?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-foreground">{user.name}</span>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{user.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary relative">
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                    </div>
                    <span className="text-[10px] font-black text-muted/60 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
