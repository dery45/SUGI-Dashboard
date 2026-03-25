import React, { useState } from 'react';
import LifecycleTabs from '../components/management/LifecycleTabs';
import NewCycleModal from '../components/management/NewCycleModal';

const LifecycleManagementPage = () => {
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const handleSaveCycle = (data) => {
    // In production: POST /api/lifecycle/cycles
    console.log('New cycle:', data);
    showToast('Siklus tanam baru berhasil dibuat!');
  };

  const statuses = ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium">
          ✓ {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Siklus Pertanian</h1>
          <p className="text-gray-500 text-sm">Kelola seluruh tahapan siklus: Persiapan Lahan, Penanaman, Perawatan, dan Panen</p>
        </div>
        <button
          onClick={() => setIsNewCycleOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm shadow-sm"
        >
          + Buat Siklus Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-2">Filter Status:</span>
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${!statusFilter ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Semua
          </button>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Lifecycle Tabs Component */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <LifecycleTabs statusFilter={statusFilter} />
      </div>

      <NewCycleModal isOpen={isNewCycleOpen} onClose={() => setIsNewCycleOpen(false)} onSave={handleSaveCycle} />
    </div>
  );
};

export default LifecycleManagementPage;
