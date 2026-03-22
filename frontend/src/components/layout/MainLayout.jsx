import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-white">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'lg:pl-0' : 'lg:pl-0'}`}>
        <TopBar onLogout={onLogout} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <main className={`flex-1 overflow-y-auto px-4 sm:px-8 pb-12 lg:px-12 scroll-smooth transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'scale-100' : 'scale-[0.98] blur-[0.5px]'}`}>
          <div className="max-w-[1600px] mx-auto w-full pt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
