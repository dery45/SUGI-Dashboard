import React, { useState, useEffect } from 'react';
import { useGenericResource } from './hooks/useGenericResource';
import { useEligibleCycles, usePelaksanaOptions, pelaksanaForCycle, buildPelaksanaChoices } from './pelaksana';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL as BASE_URL } from '@/services/authService';
import Card from '@/component/common/Card';
import DataTable from '@/component/common/DataTable';

const statusMap = { Pending: 'Tertunda', In_Progress: 'Sedang Berlangsung', Completed: 'Selesai', Cancelled: 'Dibatalkan' };
const Badge = ({ status }) => {
  const colors = { Pending: 'bg-orange-100 text-orange-700', In_Progress: 'bg-yellow-100 text-yellow-800', Completed: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700' };
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

const cycleLabel = c => {
  const farmName = c?.farm_master?.name || c?.farm_id?.name || '';
  const blockName = c?.block?.name ? ` / ${c.block.name}` : '';
  return `${c?.cycle || '(tanpa siklus)'} — ${farmName}${blockName}`;
};

const PerawatanPage = () => {
  const { token } = useAuth();
  const { data, loading, error, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/activities', token);
  const records = Array.isArray(data) ? data : [];
  const { cycles, loading: cyclesLoading } = useEligibleCycles(token, 'maintenance');
  const [activityTypes, setActivityTypes] = useState([]);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch(`${BASE_URL}/master-data/activity-types`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setActivityTypes(j.data); }).catch(() => {});
  }, [token]);
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({ crop_cycle_id: '', activity_type: '', description: '', date: '', labor_hours: '', cost: '', executor: '', status: 'Pending' });
  const assignments = usePelaksanaOptions(token);
  const selectedCycle = cycles.find(c => c._id === form.crop_cycle_id);
  const pelaksanaOptions = pelaksanaForCycle(assignments, selectedCycle);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const showToast = m => { setNotification(m); setTimeout(() => setNotification(null), 3000); };
  const fc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const filtered = filterType ? records.filter(r => (r.activity_type_ref?._id || r.activity_type) === filterType) : records;
  const totalCost = records.reduce((s, r) => s + Number(r.cost || 0), 0);
  const totalHours = records.reduce((s, r) => s + Number(r.labor_hours || 0), 0);

  const columns = [
    { header: 'Siklus', accessor: 'cycle' },
    { header: 'Jenis', accessor: r => <span className="px-2 py-0.5 rounded bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-semibold">{r.activity_type_ref?.name || activityTypes.find(a => a._id === r.activity_type)?.name || r.activity_type}</span> },
    { header: 'Deskripsi', accessor: r => <span className="line-clamp-1 max-w-[180px]" title={r.description}>{r.description}</span> },
    { header: 'Tanggal', accessor: r => r.date ? new Date(r.date).toLocaleDateString('id-ID') : '-' },
    { header: 'Jam', accessor: r => `${r.labor_hours ?? 0}j` },
    { header: 'Biaya', accessor: r => `Rp ${Number(r.cost).toLocaleString('id-ID')}` },
    { header: 'Status', accessor: r => <Badge status={r.status} /> },
  ];

  // Completed-cycle cascade lock (frontend-only): activities of a closed cycle are read-only
  const [completedCycleIds, setCompletedCycleIds] = useState(() => new Set());
  useEffect(() => {
    fetch(`${BASE_URL}/lifecycle/plantings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => {
        if (j.success) setCompletedCycleIds(new Set((j.data || []).filter(c => c.status === 'Completed').map(c => c._id)));
      }).catch(() => {});
  }, [token]);
  const isLocked = r => {
    const cid = r.crop_cycle_id?._id || r.crop_cycle_id;
    return cid && completedCycleIds.has(cid);
  };
  const LOCK_MSG = 'Siklus ini sudah selesai (Panen ditutup) — data Perawatan terkunci.';

  const openAdd = () => { setEditTarget(null); setForm({ crop_cycle_id: '', activity_type: '', description: '', date: new Date().toISOString().split('T')[0], labor_hours: '', cost: '', executor: '', status: 'Pending' }); setModal('form'); };
  const openEdit = r => {
    if (isLocked(r)) { showToast(LOCK_MSG); return; }
    setEditTarget(r);
    setForm({
      crop_cycle_id: r.crop_cycle_id?._id || r.crop_cycle_id || '',
      activity_type: r.activity_type_ref?._id || r.activity_type || '',
      description: r.description || '',
      date: r.date ? r.date.split('T')[0] : '',
      labor_hours: r.labor_hours ?? '', cost: r.cost ?? '',
      executor: r.executor || '', status: r.status || 'Pending',
    });
    setModal('form');
  };
  const handleSubmit = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try {
      const entry = {
        crop_cycle_id: form.crop_cycle_id,
        activity_type: form.activity_type, activity_type_ref: form.activity_type,
        description: form.description, date: form.date,
        labor_hours: +form.labor_hours || 0, cost: +form.cost || 0,
        executor: form.executor, status: form.status,
      };
      if (editTarget) { await updateData(editTarget._id, entry); showToast('Data perawatan diperbarui!'); }
      else { await createData(entry); showToast('Aktivitas perawatan baru ditambahkan!'); }
      setModal(null); fetchData();
    } finally { setSaving(false); }
  };
  const handleStatusChange = async (id, status) => {
    await updateData(id, { status }); showToast('Status diperbarui!');
  };

  if (error && (error.includes('403') || error.includes('Akses'))) {
    return <Card title="Perawatan"><p className="p-6 text-center text-sm font-semibold text-destructive">{error}</p><p className="pb-6 text-center text-xs text-muted -mt-2">Hubungi Owner Anda untuk mendapatkan akses tahap ini.</p></Card>;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold animate-slide-up">{notification}</div>}
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Perawatan</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Catat aktivitas pemeliharaan tanaman</p>
          </div>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-bold text-xs uppercase tracking-wider min-h-[44px]">+ Tambah Aktivitas</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="p-2 text-center"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Aktivitas</p><p className="text-2xl font-black text-foreground mt-1">{records.length}</p></div></Card>
        <Card><div className="p-2 text-center"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Jam</p><p className="text-2xl font-black text-foreground mt-1">{totalHours.toLocaleString('id-ID')}</p></div></Card>
        <Card><div className="p-2 text-center"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Biaya</p><p className="text-xl font-black text-foreground mt-1">Rp {totalCost.toLocaleString('id-ID')}</p></div></Card>
      </div>

      {activityTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterType('')} className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${!filterType ? 'bg-amber-600 text-white' : 'bg-surface border border-border/40 text-muted hover:text-primary'}`}>Semua</button>
          {activityTypes.map(a => (
            <button key={a._id} onClick={() => setFilterType(filterType === a._id ? '' : a._id)} className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${filterType === a._id ? 'bg-amber-600 text-white' : 'bg-surface border border-border/40 text-muted hover:text-primary'}`}>{a.name}</button>
          ))}
        </div>
      )}

      <Card title="Log Perawatan">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filtered}
              itemsPerPage={10}
              onEdit={openEdit}
              onDelete={id => { const rec = records.find(r => r._id === id); if (rec && isLocked(rec)) { showToast(LOCK_MSG); return; } if (confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) { deleteData(id); showToast('Data perawatan dihapus.'); } }}
            />
          </>
        )}
      </Card>

      {modal === 'form' && (
        <Modal title={editTarget ? 'Ubah Aktivitas Perawatan' : 'Tambah Aktivitas Perawatan'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FF label="Siklus Tanam">
              <select name="crop_cycle_id" value={form.crop_cycle_id} onChange={fc} required disabled={!!editTarget} className={inputCls}>
                <option value="">{cyclesLoading ? 'Memuat siklus...' : '-- Pilih Siklus Tanam --'}</option>
                {cycles.map(c => <option key={c._id} value={c._id}>{cycleLabel(c)}</option>)}
              </select>
            </FF>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Jenis Aktivitas">
                <select name="activity_type" value={form.activity_type} onChange={fc} required className={inputCls}>
                  <option value="">-- Pilih --</option>
                  {activityTypes.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </FF>
              <FF label="Tanggal"><input type="date" name="date" value={form.date} onChange={fc} required className={inputCls} /></FF>
            </div>
            <FF label="Deskripsi"><input name="description" value={form.description} onChange={fc} placeholder="Detail kegiatan..." className={inputCls} /></FF>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Jam Kerja"><input type="number" name="labor_hours" value={form.labor_hours} onChange={fc} min="0" step="0.5" placeholder="0" className={inputCls} /></FF>
              <FF label="Biaya (Rp)"><input type="number" name="cost" value={form.cost} onChange={fc} min="0" placeholder="0" className={inputCls} /></FF>
            </div>
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
            <FF label="Status">
              <select name="status" value={form.status} onChange={fc} className={inputCls}>
                {Object.entries(statusMap).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </FF>
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setModal(null)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold">Batal</button>
              <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 disabled:opacity-50">{saving ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Tambah Aktivitas')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PerawatanPage;
