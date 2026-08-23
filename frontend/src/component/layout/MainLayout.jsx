import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

// Sidebar auto-opens on tablet/laptop/desktop widths (≥768px covers iPad
// portrait+landscape, laptops, desktops); collapsed behind the hamburger on phones.
const DESKTOP_QUERY = '(min-width: 768px)';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
  );
  const { logout, user } = useAuth();

  // Keep the state in sync when the viewport crosses the breakpoint
  // (rotation, window resize, dev-tools opening), without fighting a manual toggle.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => setIsSidebarOpen(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange); // Safari < 14 / older WebKit
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-white">
      <Sidebar isOpen={isSidebarOpen} user={user} onToggle={() => setIsSidebarOpen(false)} />
      <div className={`flex-1 flex flex-col min-w-0`}>
        <TopBar onLogout={logout} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} user={user} />
        <main className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pb-24 lg:pb-6 scroll-smooth transition-all duration-500`}>
          <div className="max-w-[1600px] mx-auto w-full pt-3 sm:pt-4 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
