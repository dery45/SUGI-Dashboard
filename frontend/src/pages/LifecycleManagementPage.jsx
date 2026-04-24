import React, { useState } from 'react';
import LifecycleTabs from '../components/management/LifecycleTabs';
import NewCycleModal from '../components/management/NewCycleModal';

const LifecycleManagementPage = () => {
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const handleSaveCycle = (data) => {
    console.log('New cycle:', data);
    showToast('Siklus tanam baru berhasil dibuat!');
  };

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

      {/* Lifecycle Tabs Component */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <LifecycleTabs />
      </div>

      <NewCycleModal isOpen={isNewCycleOpen} onClose={() => setIsNewCycleOpen(false)} onSave={handleSaveCycle} />
    </div>
  );
};

export default LifecycleManagementPage;
