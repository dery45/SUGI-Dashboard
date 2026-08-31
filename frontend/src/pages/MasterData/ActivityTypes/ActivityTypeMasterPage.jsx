import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Card from '@/component/common/Card';
import DataTable from '@/component/common/DataTable';
import { Input, Select } from '@/component/common/FormField';
import { useAuth } from '@/contexts/AuthContext';
import { required, validateForm } from '@/utils/validation';
import { API_BASE_URL as BASE_URL } from '@/services/authService';
import ViewDetailModal from '@/component/common/ViewDetailModal';
import { useToast } from '@/contexts/ToastContext';

const ActivityTypeMasterPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const ACT_CATEGORIES = ['Lainnya', 'Pemupukan - Perawatan - Penyemprotan', 'Panen'];
  const [form, setForm] = useState({ name: '', category: 'Lainnya', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [viewModal, setViewModal] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/master-data/activity-types`, { headers });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validate = () => {
    const { errors: e, hasErrors } = validateForm(form, {
      name: [[required, 'Nama Aktivitas']],
    });
    setErrors(e);
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const url = editItem ? `${BASE_URL}/master-data/activity-types/${editItem._id}` : `${BASE_URL}/master-data/activity-types`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) {
        if (json.errors) { setErrors(json.errors); return; }
        showToast(json.message || 'Gagal menyimpan data', 'error');
        return;
      }
      setShowModal(false); setEditItem(null);
      setForm({ name: '', category: 'Lainnya', status: 'Active' });
      setErrors({});
      fetchData();
      showToast('Data jenis aktivitas berhasil disimpan!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    await fetch(`${BASE_URL}/master-data/activity-types/${id}`, { method: 'DELETE', headers });
    fetchData();
    showToast('Data jenis aktivitas berhasil dihapus!', 'success');
  };

  const openView = (item) => { setViewModal(item); };

  const columns = [
    { header: 'Nama', accessor: 'name' },
    { header: 'Kategori', accessor: 'category' },
    { header: 'Status', accessor: 'status' },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Master Data Jenis Aktivitas</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola jenis aktivitas budidaya</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="p-2.5 rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-all"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={() => { setEditItem(null); setForm({ name: '', category: 'Lainnya', status: 'Active' }); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Tambah Aktivitas</button>
          </div>
        </div>
      </div>

      <Card title="Daftar Jenis Aktivitas">
        <DataTable columns={columns} data={data} onView={openView} onEdit={handleEdit} onDelete={handleDelete} itemsPerPage={10} />
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-surface border border-border/40 rounded-[2rem] shadow-2xl p-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">{editItem ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nama Aktivitas" name="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Select label="Kategori" name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {ACT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="Status" name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {['Active', 'Inactive'].map(s => <option key={s} value={s}>{s === 'Active' ? 'Aktif' : 'Tidak Aktif'}</option>)}
              </Select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
      {viewModal && (
        <ViewDetailModal
          isOpen={!!viewModal}
          onClose={() => setViewModal(null)}
          record={viewModal}
          columns={columns}
          title="Detail Jenis Aktivitas"
        />
      )}
    </div>
  );
};

export default ActivityTypeMasterPage;