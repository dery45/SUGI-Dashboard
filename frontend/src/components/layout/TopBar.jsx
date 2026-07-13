import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';

const TopBar = ({ onLogout, toggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 sm:h-20 lg:h-24 flex items-center px-3 sm:px-4 lg:px-8 transition-all duration-300 sticky top-0 z-40 bg-transparent safe-area-top">
      <div className="w-full h-12 sm:h-14 lg:h-16 bg-surface/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <button 
            onClick={toggleSidebar}
            className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 flex items-center justify-center min-w-[44px] min-h-[44px] ${isSidebarOpen ? 'lg:bg-primary lg:text-white lg:shadow-lg lg:shadow-primary/25' : ''} bg-background border border-border/60 text-muted hover:text-primary hover:border-primary/50 active:scale-95 touch-manipulation`}
            aria-label={isSidebarOpen ? "Tutup Menu" : "Buka Menu"}
          >
            {isSidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background/50 border border-border/40 rounded-xl p-0.5 sm:p-1 shadow-inner">
            <button 
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-surface text-muted hover:text-primary transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <div className="w-px h-5 bg-border/40 mx-0.5" />
            <button 
              onClick={onLogout}
              className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-destructive/10 text-muted hover:text-destructive transition-all duration-200 flex items-center justify-center active:scale-95 touch-manipulation"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
