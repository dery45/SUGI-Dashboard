import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user } = useAuth();

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
