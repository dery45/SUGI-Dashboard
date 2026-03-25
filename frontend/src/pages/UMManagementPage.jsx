import React, { useState } from 'react';
import UMAssignmentModal from '../components/management/UMAssignmentModal';

const dummyUMs = [
  { id: 1, name: 'Budi Harjo', um_id: 'UM-001', processes: ['Panen', 'Perawatan'], farms: 'Blok A, Blok C', score: 85, status: 'Active' },
  { id: 2, name: 'Siti Aminah', um_id: 'UM-002', processes: ['Penanaman'], farms: 'Blok B', score: 72, status: 'Active' },
  { id: 3, name: 'Joko Widodo', um_id: 'UM-003', processes: ['Persiapan Lahan'], farms: 'Blok D', score: 91, status: 'Active' },
  { id: 4, name: 'Rina Susanti', um_id: 'UM-004', processes: [], farms: '-', score: 0, status: 'Inactive' },
];

const UMManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [umList, setUmList] = useState(dummyUMs);

  const handleSaveUM = (formData) => {
    const newUM = {
      id: umList.length + 1,
      name: `User ${formData.user_id}`,
      um_id: formData.um_id,
      processes: formData.assigned_processes.map(p => p.replace('_', ' ')),
      farms: '-',
      score: 0,
      status: 'Active',
    };
    setUmList(prev => [...prev, newUM]);
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
              {umList.map((um) => (
                <tr key={um.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{um.um_id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{um.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {um.processes.length > 0 
                        ? um.processes.map((p, i) => (
                          <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{p}</span>
                        ))
                        : <span className="text-gray-400 text-xs italic">Belum ditugaskan</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{um.farms}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-sm px-2.5 py-1 rounded-lg ${getScoreColor(um.score)}`}>
                      {um.score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${um.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {um.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
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
