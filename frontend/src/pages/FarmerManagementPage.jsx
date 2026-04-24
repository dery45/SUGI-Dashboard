import React, { useState } from 'react';
import NewFarmerModal from '../components/management/NewFarmerModal';

const ROLE_LABELS = { Farmer: 'Petani', UM: 'Unit Manajemen', Group_Admin: 'Admin Kelompok', Company_Admin: 'Admin Perusahaan' };
const ROLE_COLORS = { Farmer: 'bg-green-100 text-green-700', UM: 'bg-blue-100 text-blue-700', Group_Admin: 'bg-purple-100 text-purple-700', Company_Admin: 'bg-orange-100 text-orange-700' };

const dummyFarmers = [
  { _id: '1', name: 'Budi Santoso',  email: 'budi@contoh.com',  phone: '0812-3456-7890', role: 'Farmer',        address: 'Desa Margatani, Lampung' },
  { _id: '2', name: 'Siti Aminah',   email: 'siti@contoh.com',  phone: '0813-9876-5432', role: 'UM',            address: 'Kec. Bukit Baru, Sumatra' },
  { _id: '3', name: 'Joko Purnomo',  email: 'joko@contoh.com',  phone: '0821-1111-2222', role: 'Group_Admin',   address: 'Desa Sejahtera, Kalimantan' },
  { _id: '4', name: 'Rina Dewi',     email: 'rina@contoh.com',  phone: '0817-5555-6666', role: 'Farmer',        address: 'Kab. Pelalawan, Riau' },
  { _id: '5', name: 'Hendra Kusuma', email: 'hendra@contoh.com', phone: '0856-7777-8888', role: 'Company_Admin', address: 'Jakarta Selatan' },
];

const FarmerManagementPage = () => {
  const [users, setUsers] = useState(dummyFarmers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const handleSave = async (data) => {
    // In production: await createFarmer(token, data);
    const newUser = { _id: Date.now().toString(), ...data };
    setUsers(prev => [newUser, ...prev]);
    showToast(`Pengguna "${data.name}" berhasil ditambahkan!`);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus pengguna "${name}" dari organisasi?`)) {
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast(`"${name}" berhasil dihapus.`);
    }
  };

  const filtered = users
    .filter(u => !roleFilter || u.role === roleFilter)
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const roleStats = ['Farmer', 'UM', 'Group_Admin', 'Company_Admin'].map(r => ({
    role: r, count: users.filter(u => u.role === r).length
  }));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium">
          ✓ {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Petani & Pengguna</h1>
          <p className="text-gray-500 text-sm">Kelola seluruh akun pengguna dalam organisasi Anda</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm shadow-sm">
          + Tambah Pengguna
        </button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roleStats.map(({ role, count }) => (
          <button key={role} onClick={() => setRoleFilter(prev => prev === role ? '' : role)}
            className={`p-4 rounded-xl border-2 text-left transition ${roleFilter === role ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase">{ROLE_LABELS[role]}</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{count}</p>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {roleFilter && (
          <button onClick={() => setRoleFilter('')} className="text-sm text-blue-600 font-medium px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50">
            ✕ {ROLE_LABELS[roleFilter]}
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Daftar Pengguna</h2>
          <span className="text-sm text-gray-400">{filtered.length} pengguna</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Nama</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Telepon</th>
                <th className="px-6 py-3 text-left">Peran</th>
                <th className="px-6 py-3 text-left">Alamat</th>
                <th className="px-6 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">Tidak ada pengguna ditemukan.</td></tr>
              )}
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 text-gray-500">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs max-w-[180px] truncate">{user.address || '-'}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">Edit</button>
                    <button onClick={() => handleDelete(user._id, user.name)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewFarmerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
    </div>
  );
};

export default FarmerManagementPage;
