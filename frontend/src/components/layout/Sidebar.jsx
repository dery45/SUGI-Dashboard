import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Tractor, Building2, Database, ChevronDown, ChevronRight } from 'lucide-react';
import { dataRegistry } from '../../pages/MasterDataPage';

const Sidebar = ({ isOpen }) => {
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const location = useLocation();
  const isDataActive = location.pathname.startsWith('/data');

  const navItems = [
    { name: 'Farmer Dashboard', path: '/farmer', icon: <Tractor className="w-5 h-5" /> },
    { name: 'Government Dashboard', path: '/government', icon: <Building2 className="w-5 h-5" /> }
  ];

  const dataLinks = Object.keys(dataRegistry).map(slug => ({
    name: dataRegistry[slug].title,
    path: `/data/${slug}`
  }));

  return (
    <aside className={`fixed lg:relative inset-y-0 left-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'w-80 p-4 translate-x-0' : 'w-0 p-0 -translate-x-full lg:translate-x-0 overflow-hidden'}`}>
      <div className={`h-full bg-surface/80 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${!isOpen ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}>
        <div className="w-72 flex flex-col h-full flex-shrink-0">
          <div className="h-20 flex items-center px-8 border-b border-border/30 flex-shrink-0">
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform duration-500 hover:rotate-12">S</div>
              <div className="flex flex-col leading-none">
                <span className="text-primary text-lg font-black italic">SUGI</span>
                <span className="text-foreground/40 text-[10px] uppercase tracking-[0.2em] font-black">Dashboard</span>
              </div>
            </h1>
          </div>
          
          <nav className="flex-1 p-4 flex flex-col gap-2 mt-4 relative overflow-y-auto custom-scrollbar">
            <p className="px-5 text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-4 opacity-40">Main Menu</p>
            {navItems.map((item, i) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `group flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative ${isActive ? 'bg-primary text-white shadow-2xl shadow-primary/30 translate-x-1.5' : 'text-muted hover:bg-primary/5 hover:text-primary hover:translate-x-1'}`}
              >
                <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110">
                  {item.icon}
                </div>
                <span className="text-[13px] font-black tracking-tight">{item.name}</span>
                <div className={`absolute right-6 w-1 h-4 rounded-full bg-white/40 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
              </NavLink>
            ))}

            <div className="mt-2">
              <button
                onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                className={`w-full group flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDataActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-primary/5 hover:text-primary hover:translate-x-1'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${isDataActive ? 'scale-110' : ''}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-black tracking-tight text-left">Semua Data Saya</span>
                </div>
                {isDataMenuOpen ? <ChevronDown className="w-4 h-4 opacity-50 transition-transform duration-300 transform rotate-180" /> : <ChevronDown className="w-4 h-4 opacity-50 transition-transform duration-300" />}
              </button>

              <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDataMenuOpen ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-border/40 ml-8 py-2">
                  {dataLinks.map(link => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) => `block px-4 py-3 rounded-xl text-[11px] font-bold transition-all duration-300 leading-snug ${isActive ? 'bg-primary/10 text-primary translate-x-1' : 'text-muted hover:text-primary hover:bg-primary/5 hover:translate-x-1'}`}
                      title={link.name}
                    >
                      <span className="line-clamp-2">{link.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="p-6 mt-auto">
            <div className="p-5 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col gap-3 group/status cursor-default">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">System Status</p>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary relative">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                </div>
                <span className="text-[11px] font-black text-foreground group-hover/status:text-primary transition-colors">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
