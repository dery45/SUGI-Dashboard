import { useTheme } from '../../contexts/ThemeContext';
import { useFilter } from '../../contexts/FilterContext';
import { Sun, Moon, LogOut, Menu, X, Calendar } from 'lucide-react';

const TopBar = ({ onLogout, toggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { dateRange, setDateRange } = useFilter();

  const handleDateChange = (e) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <header className="h-24 flex items-center px-8 transition-all duration-300 sticky top-0 z-40 bg-transparent">
      <div className="w-full h-16 bg-surface/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleSidebar}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${isSidebarOpen ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-background border border-border/60 text-muted hover:text-primary hover:border-primary/50'}`}
            aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          
          <div className="hidden lg:flex items-center bg-background/50 border border-border/40 rounded-xl p-1 shadow-inner">
            <div className="flex items-center px-3 py-1 gap-2 border-r border-border/40">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Range</span>
            </div>
            <div className="flex items-center gap-1 px-3">
              <input 
                type="date" 
                name="startDate"
                value={dateRange.startDate} 
                onChange={handleDateChange}
                className="bg-transparent text-foreground text-xs font-bold focus:outline-none cursor-pointer"
              />
              <span className="text-muted text-[10px] font-black mx-1">—</span>
              <input 
                type="date" 
                name="endDate"
                value={dateRange.endDate} 
                onChange={handleDateChange}
                className="bg-transparent text-foreground text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-background/50 border border-border/40 rounded-xl p-1 shadow-inner">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-surface text-muted hover:text-primary transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-border/40 mx-0.5" />
            <button 
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted hover:text-destructive transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
