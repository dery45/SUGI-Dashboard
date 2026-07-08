import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Leaf, DollarSign, Settings, Building2, Tractor, BarChart3 } from 'lucide-react';

const linksByRole = {
  farmer: [
    { to: '/farmer', label: 'Dashboard', icon: LayoutDashboard },
  ],
  farmer_owner: [
    { to: '/farmer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/management', label: 'Analitik', icon: BarChart3 },
    { to: '/management/sales', label: 'Penjualan', icon: DollarSign },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ],
  superadmin: [
    { to: '/management', label: 'Analitik', icon: BarChart3 },
    { to: '/management/lifecycle', label: 'Siklus', icon: Leaf },
    { to: '/management/sales', label: 'Penjualan', icon: DollarSign },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ],
  government: [
    { to: '/government', label: 'Dashboard', icon: Building2 },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ],
};

const BottomNav = () => {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || linksByRole.farmer;

  if (!user) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-2xl border-t border-border/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/farmer' || link.to === '/government' || link.to === '/management'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted/60 hover:text-muted active:scale-95'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold leading-none ${isActive ? '' : 'opacity-70'}`}>
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
