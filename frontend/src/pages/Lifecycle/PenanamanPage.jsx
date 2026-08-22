import React, { useState, useEffect } from 'react';
import { useGenericResource } from './hooks/useGenericResource';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL as BASE_URL } from '@/services/authService';
import Card from '@/component/common/Card';
import DataTable from '@/component/common/DataTable';

const statusMap = { Open: 'Terbuka', Closed: 'Tertutup', Completed: 'Selesai', In_Progress: 'Sedang Berlangsung', Pending: 'Tertunda', Cancelled: 'Dibatalkan', Planned: 'Direncanakan', Planted: 'Ditanam', Maintenance: 'Perawatan', Harvesting: 'Panen' };
const Badge = ({ status }) => {
  const colors = { Planned: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10', Land_Preparation: 'bg-blue-100 text-blue-700', Planted: 'bg-emerald-100 text-emerald-700', In_Progress: 'bg-yellow-100 text-yellow-800', Completed: 'bg-blue-100 text-blue-700', Cancelled: 'bg-red-100 text-red-700' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{statusMap[status] || status?.replace(/_/g, ' ') || '-'}</span>;
};
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
    <div className="absolute inset-0 backdrop-blur-sm" />
    <div className="relative w-full sm:max-w-lg bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-black text-foreground">{title}</h2><button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border/40 hover:border-primary transition-all">✕</button></div>
      {children}
    </div>
  </div>
);
const FF = ({ label, children }) => (<div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</label>{children}</div>);
const inputCls = "w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

import { useEligibleCycles, usePelaksanaOptions, pelaksanaForCycle, buildPelaksanaChoices } from './pelaksana';
const cycleLabel = c => {
  const farmName = c?.farm_master?.name || c?.farm_id?.name || '';
  const blockName = c?.block?.name ? ` / ${c.block.name}` : '';
  const status = statusMap[c?.status] || String(c?.status || '').replace(/_/g, ' ');
  return `${c?.cycle || '(tanpa siklus)'} — ${farmName}${blockName} (${status})`;
};

const PenanamanPage = () => {
  const { token } = useAuth();
  const { data, loading, error, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/plantings', token);
  const records = Array.isArray(data) ? data : [];
  const { cycles, loading: cyclesLoading } = useEligibleCycles(token, 'planting');
  const [cropTypes, setCropTypes] = useState([]);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch(`${BASE_URL}/master-data/crop-types`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setCropTypes(j.data); }).catch(() => {});
  }, [token]);
  const [form, setForm] = useState({ crop_cycle_id: '', crop_type: '', variety: '', planting_date: '', area_ha: '', seedling_count: '', executor: '', notes: '' });
  const assignments = usePelaksanaOptions(token);
  const selectedCycle = cycles.find(c => c._id === form.crop_cycle_id);
  const pelaksanaOptions = pelaksanaForCycle(assignments, selectedCycle);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const showToast = m => { setNotification(m); setTimeout(() => setNotification(null), 3000); };
  const fc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const columns = [
    { header: 'Farm / Blok', accessor: r => `${r.farm_master?.name || r.farm_id?.name || '-'}${r.block?.name ? ` / ${r.block.name}` : ''}` },
    { header: 'Siklus', accessor: 'cycle' },
    { header: 'Tanaman', accessor: r => `${r.crop_type_ref?.name || r.crop_type || '-'}${r.variety ? ` (${r.variety})` : ''}` },
    { header: 'Tgl Tanam', accessor: r => r.planting_date ? new Date(r.planting_date).toLocaleDateString('id-ID') : '-' },
    { header: 'Luas (Ha)', accessor: r => (r.area_ha != null ? `${r.area_ha} ha` : '-') },
    { header: 'Bibit', accessor: r => (r.seedling_count != null ? r.seedling_count.toLocaleString('id-ID') : '-') },
    { header: 'Status', accessor: r => <Badge status={r.status} /> },
  ];

  const LOCK_MSG = 'Siklus ini sudah selesai (Panen ditutup) — data Penanaman terkunci.';
  const isLocked = r => r.status === 'Completed' || r.status === 'Failed';
  const openAdd = () => { setEditTarget(null); setForm({ crop_cycle_id: '', crop_type: '', variety: '', planting_date: new Date().toISOString().split('T')[0], area_ha: '', seedling_count: '', executor: '', notes: '' }); setModal('form'); };
  const openEdit = r => {
    if (isLocked(r)) { showToast(LOCK_MSG); return; }
    setEditTarget(r);
    setForm({
      crop_cycle_id: r.crop_cycle_id?._id || r.crop_cycle_id || r._id,
      crop_type: r.crop_type_ref?._id || r.crop_type || '',
      variety: r.variety || '',
      planting_date: r.planting_date ? r.planting_date.split('T')[0] : '',
      area_ha: r.area_ha ?? '',
      seedling_count: r.seedling_count ?? '',
      executor: r.executor || '', notes: r.notes || '',
    });
    setModal('form');
  };
  const handleSubmit = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try {
      const entry = {
        crop_cycle_id: form.crop_cycle_id,
        crop_type: form.crop_type, crop_type_ref: form.crop_type,
        variety: form.variety, planting_date: form.planting_date,
        area_ha: +form.area_ha || 0, seedling_count: +form.seedling_count || 0,
        executor: form.executor, notes: form.notes,
      };
      if (form.farm_master) entry.farm_master = form.farm_master;
      if (form.block) entry.block = form.block;
      if (editTarget) { await updateData(editTarget._id === form.crop_cycle_id ? editTarget._id : editTarget._id, entry); showToast('Data penanaman diperbarui!'); }
      else { await createData(entry); showToast('Aktivitas penanaman baru ditambahkan!'); }
      setModal(null); fetchData();
    } finally { setSaving(false); }
  };

  if (error && (error.includes('403') || error.includes('Akses'))) {
    return <Card title="Penanaman"><p className="p-6 text-center text-sm font-semibold text-destructive">{error}</p><p className="pb-6 text-center text-xs text-muted -mt-2">Hubungi Owner Anda untuk mendapatkan akses tahap ini.</p></Card>;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold animate-slide-up">{notification}</div>}
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Penanaman</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Catat aktivitas penanaman pada siklus yang sudah ada</p>
          </div>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold text-xs uppercase tracking-wider min-h-[44px]">+ Tambah Penanaman</button>
      </div>

      <Card title="Log Penanaman">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={records} onEdit={openEdit} onDelete={id => { const rec = records.find(r => r._id === id); if (rec && isLocked(rec)) { showToast(LOCK_MSG); return; } if (confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) { deleteData(id); showToast('Data penanaman dihapus.'); } }} itemsPerPage={10} />
        )}
      </Card>

      {modal === 'form' && (
        <Modal title={editTarget ? 'Ubah Data Penanaman' : 'Tambah Penanaman Baru'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FF label="Siklus Tanam">
              <select name="crop_cycle_id" value={form.crop_cycle_id} onChange={fc} required disabled={!!editTarget} className={inputCls}>
                <option value="">{cyclesLoading ? 'Memuat siklus...' : '-- Pilih Siklus Tanam --'}</option>
                {cycles.map(c => <option key={c._id} value={c._id}>{cycleLabel(c)}</option>)}
              </select>
            </FF>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Jenis Tanaman">
                <select name="crop_type" value={form.crop_type} onChange={fc} required className={inputCls}>
                  <option value="">-- Pilih --</option>
                  {cropTypes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </FF>
              <FF label="Tanggal Tanam"><input type="date" name="planting_date" value={form.planting_date} onChange={fc} required className={inputCls} /></FF>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Varietas"><input name="variety" value={form.variety} onChange={fc} placeholder="DxP, Arabika, dll" className={inputCls} /></FF>
              <FF label="Pelaksana">
                <select name="executor" value={form.executor} onChange={fc} className={inputCls}>
                  <option value="">-- Pilih Pelaksana --</option>
                  {buildPelaksanaChoices(pelaksanaOptions, form.executor && !pelaksanaOptions.includes(form.executor) ? form.executor : '').map(n => (
                    <option key={n} value={n}>{n}{!pelaksanaOptions.includes(n) ? ' (nilai tersimpan)' : ''}</option>
                  ))}
                </select>
                {!form.crop_cycle_id && <p className="text-[10px] text-muted italic mt-1">Pilih Siklus Tanam terlebih dahulu untuk melihat Pelaksana.</p>}
                {form.crop_cycle_id && pelaksanaOptions.length === 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                    Tidak ada petani yang ditugaskan pada farm &amp; blok siklus ini. Hubungi Owner Anda melalui menu Penugasan.
                  </p>
                )}
              </FF>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Luas Area (Ha)"><input type="number" name="area_ha" value={form.area_ha} onChange={fc} required step="0.1" min="0" placeholder="5.0" className={inputCls} /></FF>
              <FF label="Jumlah Bibit"><input type="number" name="seedling_count" value={form.seedling_count} onChange={fc} min="0" placeholder="0" className={inputCls} /></FF>
            </div>
            <div className="bg-background/60 border border-border/30 rounded-xl p-3 text-xs text-muted">Siklus Tanam dibuat saat Persiapan Lahan. Penanaman mencatat data pada siklus yang sudah ada dan otomatis memajukan statusnya menjadi Ditanam.</div>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} placeholder="Catatan tambahan..." className={`${inputCls} resize-none`} /></FF>
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setModal(null)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold">Batal</button>
              <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Tambah Penanaman')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PenanamanPage;
