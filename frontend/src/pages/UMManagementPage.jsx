import React, { useState, useEffect } from 'react';
import UMAssignmentModal from '../components/management/UMAssignmentModal';
import { useGenericResource } from '../hooks/useGenericResource';

const UMManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: umList, loading, fetchData, createData } = useGenericResource('um');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveUM = async (formData) => {
    const payload = {
      user_id: formData.user_id || '661faecfc11c4c1a2b000000', // Mock fallback if unselected
      um_id: formData.um_id,
      assigned_processes: formData.assigned_processes,
      assigned_farms: [], // Optional
      start_date: new Date().toISOString()
    };
    await createData(payload);
    setIsModalOpen(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Unit Manajemen (UM)</h1>
          <p className="text-gray-500 text-sm">Tugaskan, kelola, dan pantau kinerja Unit Manajemen</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition text-sm shadow-sm"
        >
          + Tambah Penugasan UM
        </button>
      </div>

      {/* UM Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase">Total UM</p>
          <p className="text-2xl font-bold text-blue-800">{umList.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-xs font-semibold text-green-600 uppercase">Aktif</p>
          <p className="text-2xl font-bold text-green-800">{umList.filter(u => u.status === 'Active').length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-xs font-semibold text-red-600 uppercase">Belum Ditugaskan</p>
          <p className="text-2xl font-bold text-red-800">{umList.filter(u => u.processes.length === 0).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <p className="text-xs font-semibold text-purple-600 uppercase">Rata-rata Skor</p>
          <p className="text-2xl font-bold text-purple-800">
            {umList.length > 0 ? Math.round(umList.reduce((s, u) => s + u.score, 0) / umList.length) : 0}
          </p>
        </div>
      </section>

      {/* UM Leaderboard Table */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">📋 Daftar & Leaderboard UM</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">UM ID</th>
                <th className="px-6 py-3 text-left">Nama</th>
                <th className="px-6 py-3 text-left">Proses Ditugaskan</th>
                <th className="px-6 py-3 text-left">Lahan</th>
                <th className="px-6 py-3 text-left">Skor Kinerja</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">Memuat data...</td></tr>}
              {!loading && umList.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">Belum ada UM.</td></tr>}
              {umList.map((um) => (
                <tr key={um._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{um.um_id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{um.user_id?.name || 'User'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {um.assigned_processes?.length > 0 
                        ? um.assigned_processes.map((p, i) => (
                          <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{p}</span>
                        ))
                        : <span className="text-gray-400 text-xs italic">Belum ditugaskan</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{um.assigned_farms?.length || 0} Blok</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-sm px-2.5 py-1 rounded-lg ${getScoreColor(um.performance_metrics?.overall_score || 0)}`}>
                      {um.performance_metrics?.overall_score || 0}/100
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${um.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {um.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold mr-2">Edit</button>
                    <button className="text-red-500 hover:text-red-700 text-xs font-semibold">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <UMAssignmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveUM} />
    </div>
  );
};

export default UMManagementPage;
