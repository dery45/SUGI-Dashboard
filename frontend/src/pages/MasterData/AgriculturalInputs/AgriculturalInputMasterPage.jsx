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

const TYPE_LABELS = { Fertilizer: 'Pupuk', Nutrient: 'Nutrisi', Medicine: 'Obat' };
const TYPE_OPTIONS = [
  { value: 'Fertilizer', label: 'Pupuk' },
  { value: 'Nutrient', label: 'Nutrisi' },
  { value: 'Medicine', label: 'Obat' },
];

const AgriculturalInputMasterPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Fertilizer', unit: '', description: '', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [viewModal, setViewModal] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const { showToast } = useToast();
  const endpoint = 'agricultural-inputs';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const typeQuery = typeFilter ? `?type=${typeFilter}` : '';
      const [rD, rU] = await Promise.all([
        fetch(`${BASE_URL}/master-data/${endpoint}${typeQuery}`, { headers }).then(r => r.json()),
        fetch(`${BASE_URL}/master-data/units/all`, { headers }).then(r => r.json()),
      ]);
      if (rD.success) setData(rD.data);
      if (rU.success) setUnits(rU.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [token, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validate = () => {
    const { errors: e, hasErrors } = validateForm(form, { name: [[required, 'Nama Input']], type: [[required, 'Tipe Input']], unit: [[required, 'Satuan']] });
    setErrors(e); return !hasErrors;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const url = editItem ? `${BASE_URL}/master-data/${endpoint}/${editItem._id}` : `${BASE_URL}/master-data/${endpoint}`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) { if (json.errors) { setErrors(json.errors); return; } showToast(json.message || 'Gagal menyimpan data', 'error'); return; }
      setShowModal(false); setEditItem(null); setForm({ name: '', type: 'Fertilizer', unit: '', description: '', status: 'Active' }); setErrors({}); fetchData(); showToast('Data input pertanian berhasil disimpan!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => { setEditItem(item); setForm({ name: item.name, type: item.type, unit: item.unit?._id || item.unit, description: item.description || '', status: item.status }); setErrors({}); setShowModal(true); };
  const handleDelete = async (id) => { if (!confirm('Hapus data ini?')) return; await fetch(`${BASE_URL}/master-data/${endpoint}/${id}`, { method: 'DELETE', headers }); fetchData(); showToast('Data input pertanian berhasil dihapus!', 'success'); };

  const columns = [
    { header: 'Nama', accessor: 'name' },
    { header: 'Tipe', accessor: r => TYPE_LABELS[r.type] || r.type },
    { header: 'Satuan', accessor: r => r.unit ? `${r.unit.name} (${r.unit.symbol})` : '-' },
    { header: 'Deskripsi', accessor: r => <span className="line-clamp-1 max-w-[200px]">{r.description || '-'}</span> },
    { header: 'Status', accessor: 'status' },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3"><div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" /><div><h1 className="text-2xl font-black text-foreground tracking-tight">Master Data Pupuk, Nutrisi, atau Obat</h1><p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola input pertanian terpadu</p></div></div>
          <div className="flex gap-3"><button onClick={fetchData} className="p-2.5 rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-all"><RefreshCw className="w-4 h-4" /></button><button onClick={() => { setEditItem(null); setForm({ name: '', type: 'Fertilizer', unit: '', description: '', status: 'Active' }); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Tambah Input</button></div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Filter Tipe:</span>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-surface border border-border/50 rounded-xl text-sm">
          <option value="">Semua Tipe</option>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Card title="Daftar Input Pertanian"><DataTable columns={columns} data={data} onView={setViewModal} onEdit={handleEdit} onDelete={handleDelete} itemsPerPage={10} /></Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-surface border border-border/40 rounded-[2rem] shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">{editItem ? 'Edit Input Pertanian' : 'Tambah Input Pertanian Baru'}</h2>
            <div className="grid grid-cols-1 gap-4">
              <Input label="Nama Input" name="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Select label="Tipe Input" name="type" required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} error={errors.type}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
              <Select label="Satuan" name="unit" required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} error={errors.unit}><option value="">-- Pilih Satuan --</option>{units.map(u => <option key={u._id} value={u._id}>{u.name} ({u.symbol})</option>)}</Select>
              <Select label="Status" name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['Active', 'Inactive'].map(s => <option key={s} value={s}>{s === 'Active' ? 'Aktif' : 'Tidak Aktif'}</option>)}</Select>
              <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-wider">Deskripsi <span className="text-muted/50 font-normal normal-case">(Optional)</span></label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold">Batal</button><button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">Simpan</button></div>
          </div>
        </div>
      )}
      {viewModal && <ViewDetailModal isOpen={!!viewModal} onClose={() => setViewModal(null)} record={{ name: viewModal.name, tipe: TYPE_LABELS[viewModal.type] || viewModal.type, satuan: viewModal.unit ? `${viewModal.unit.name} (${viewModal.unit.symbol})` : '-', description: viewModal.description || '-', status: viewModal.status }} columns={[{ header: 'Nama', accessor: 'name' }, { header: 'Tipe', accessor: 'tipe' }, { header: 'Satuan', accessor: 'satuan' }, { header: 'Deskripsi', accessor: 'description' }, { header: 'Status', accessor: 'status' }]} title="Detail Input Pertanian" />}
    </div>
  );
};
export default AgriculturalInputMasterPage;
