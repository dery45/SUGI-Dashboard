import React, { useState, useEffect } from 'react';
import { useGenericResource } from './hooks/useGenericResource';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL as BASE_URL } from '@/services/authService';
import Card from '@/component/common/Card';
import DataTable from '@/component/common/DataTable';

const statusMap = {
  Open: 'Terbuka', Closed: 'Tertutup', Completed: 'Selesai', In_Progress: 'Sedang Berlangsung',
  Pending: 'Tertunda', Cancelled: 'Dibatalkan', Planned: 'Direncanakan',
};
const Badge = ({ status }) => {
  const colors = { Open: 'bg-green-100 text-green-800', Closed: 'bg-gray-100 text-gray-600', Completed: 'bg-blue-100 text-blue-700', In_Progress: 'bg-yellow-100 text-yellow-800', Pending: 'bg-orange-100 text-orange-700', Cancelled: 'bg-red-100 text-red-700', Planned: 'bg-purple-100 text-purple-700' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{statusMap[status] || status?.replace(/_/g, ' ') || '-'}</span>;
};
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
    <div className="relative w-full sm:max-w-lg bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-black text-foreground">{title}</h2><button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border/40 hover:border-primary transition-all">✕</button></div>
      {children}
    </div>
  </div>
);
const FF = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</label>
    {children}
  </div>
);
const inputCls = "w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

function useBlocks(token, farmId) {
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    if (!farmId) { setBlocks([]); return; }
    fetch(`${BASE_URL}/master-data/blocks?farm=${farmId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setBlocks(j.data); }).catch(() => setBlocks([]));
  }, [farmId, token]);
  return blocks;
}

const PersiapanLahanPage = () => {
  const { token, user } = useAuth();
  const { data, loading, error, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/land', token);
  const records = Array.isArray(data) ? data : [];
  const [farms, setFarms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/master-data/farms`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      user?.role === 'farmer' ? fetch(`${BASE_URL}/assignments/farmer-assignments`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ success: false })) : Promise.resolve({ success: false }),
    ]).then(([fj, aj]) => {
      if (fj.success) setFarms(fj.data);
      if (aj.success) setAssignments(aj.data);
    }).catch(() => {});
  }, [token, user?.role]);
  const isFarmer = user?.role === 'farmer';
  // Petani farm scope mirrors the backend guard: only farms in their assignment
  const availableFarms = (() => {
    if (!isFarmer) return farms;
    const ids = [...new Set(assignments.flatMap(a => [a.farm?._id || a.farm]).filter(Boolean))];
    return ids.length ? farms.filter(f => ids.includes(f._id)) : [];
  })();
  const farmLocked = availableFarms.length === 1;
  const [form, setForm] = useState({ farm_id: '', block: '', cycle: '', opening_date: '', clearing_cost: '', notes: '' });
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [closingDate, setClosingDate] = useState('');
  const [saving, setSaving] = useState(false);
  // Completed-cycle cascade lock (frontend-only, Phase 4c Task 3):
  // cycles whose Panen closed are status 'Completed' → their Persiapan Lahan
  // record auto-filled Tgl Tutup/Tertutup at close-time and is now read-only.
  const [completedCycleIds, setCompletedCycleIds] = useState(() => new Set());
  useEffect(() => {
    fetch(`${BASE_URL}/lifecycle/plantings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => {
        if (j.success) setCompletedCycleIds(new Set((j.data || []).filter(c => c.status === 'Completed').map(c => c._id)));
      }).catch(() => {});
  }, [token]);
  const isLocked = r => r.status === 'Closed' || (r.crop_cycle_id && completedCycleIds.has(r.crop_cycle_id._id || r.crop_cycle_id));
  const blocks = useBlocks(token, form.farm_id);
  const [notification, setNotification] = useState(null);
  const showToast = m => { setNotification(m); setTimeout(() => setNotification(null), 3000); };
  const fc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const columns = [
    { header: 'Farm / Blok', accessor: r => `${r.farm_master?.name || r.farm_id?.name || r.farm || '-'}${r.block?.name ? ` / ${r.block.name}` : ''}` },
    { header: 'Siklus', accessor: 'cycle' },
    { header: 'Tgl Buka', accessor: r => r.land_opening_date ? new Date(r.land_opening_date).toLocaleDateString('id-ID') : '-' },
    { header: 'Tgl Tutup', accessor: r => r.land_closing_date ? new Date(r.land_closing_date).toLocaleDateString('id-ID') : '-' },
    { header: 'Biaya (Rp)', accessor: r => r.clearing_cost ? `Rp ${Number(r.clearing_cost).toLocaleString('id-ID')}` : '-' },
    { header: 'Status', accessor: r => <Badge status={r.status} /> },
  ];

  const openAdd = () => { setEditTarget(null); setForm({ farm_id: farmLocked && availableFarms[0] ? availableFarms[0]._id : '', block: '', cycle: '', opening_date: new Date().toISOString().split('T')[0], clearing_cost: '', notes: '' }); setModal('add'); };
  const LOCK_MSG = 'Siklus ini sudah selesai (Panen ditutup) — data Persiapan Lahan terkunci.';
  const openEdit = r => { if (isLocked(r)) { showToast(LOCK_MSG); return; } setEditTarget(r); setForm({ farm_id: r.farm_id?._id || r.farm_id || '', block: r.block?._id || r.block || '', cycle: r.cycle || '', opening_date: r.land_opening_date ? r.land_opening_date.split('T')[0] : '', clearing_cost: r.clearing_cost || '', notes: r.notes || '' }); setModal('edit'); };
  const openClose = r => { setEditTarget(r); setClosingDate(new Date().toISOString().split('T')[0]); setModal('close'); };

  const handleAdd = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try {
      const payload = { farm_id: form.farm_id, cycle: form.cycle, land_opening_date: form.opening_date, clearing_cost: +form.clearing_cost || 0, notes: form.notes, status: 'Open' };
      if (form.block) { payload.block = form.block; payload.farm_master = form.farm_id; }
      await createData(payload); showToast('Lahan baru berhasil dibuka!'); setModal(null); fetchData();
    } finally { setSaving(false); }
  };
  const handleEdit = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try {
      const payload = { cycle: form.cycle, land_opening_date: form.opening_date, clearing_cost: +form.clearing_cost || 0, notes: form.notes };
      if (form.block) { payload.block = form.block; payload.farm_master = form.farm_id; }
      await updateData(editTarget._id, payload); showToast('Data lahan diperbarui!'); setModal(null); fetchData();
    } finally { setSaving(false); }
  };
  const handleClose = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try { await updateData(editTarget._id, { land_closing_date: closingDate, status: 'Closed' }); showToast('Lahan berhasil ditutup!'); setModal(null); fetchData(); }
    finally { setSaving(false); }
  };

  if (error && (error.includes('403') || error.includes('Akses'))) {
    return <Card title="Persiapan Lahan"><p className="p-6 text-center text-sm font-semibold text-destructive">{error}</p><p className="pb-6 text-center text-xs text-muted -mt-2">Hubungi Owner Anda untuk mendapatkan akses tahap ini.</p></Card>;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold animate-slide-up">{notification}</div>}
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Persiapan Lahan</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Membuka lahan membuat Siklus Tanam baru — titik awal semua tahapan</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold text-xs uppercase tracking-wider min-h-[44px]">+ Buka Lahan Baru</button>
      </div>

      <Card title="Daftar Lahan">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <DataTable
            columns={columns}
            data={records}
            onEdit={openEdit}
            onDelete={id => {
              const rec = records.find(r => r._id === id);
              if (rec && isLocked(rec)) { showToast(LOCK_MSG); return; }
              if (confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) { deleteData(id); showToast('Data lahan dihapus.'); }
            }}
            itemsPerPage={10} />
        )}
      </Card>

      {modal === 'add' && (
        <Modal title="Buka Lahan Baru" onClose={() => setModal(null)}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Farm"><select name="farm_id" value={form.farm_id} onChange={fc} required disabled={farmLocked} className={inputCls}><option value="">Pilih Farm</option>{availableFarms.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}</select></FF>
              {form.farm_id && <FF label="Blok"><select name="block" value={form.block} onChange={fc} className={inputCls}><option value="">Pilih Blok</option>{blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}</select></FF>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Siklus Tanam"><input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" className={inputCls} /></FF>
              <FF label="Tgl Buka"><input type="date" name="opening_date" value={form.opening_date} onChange={fc} required className={inputCls} /></FF>
            </div>
            <FF label="Biaya Pembersihan (Rp)"><input type="number" name="clearing_cost" value={form.clearing_cost} onChange={fc} min="0" placeholder="0" className={inputCls} /></FF>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} placeholder="Catatan tambahan..." className={`${inputCls} resize-none`} /></FF>
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setModal(null)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
              <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50">{saving ? 'Menyimpan...' : 'Buka Lahan'}</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'edit' && (
        <Modal title="Ubah Data Lahan" onClose={() => setModal(null)}>
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Farm"><select name="farm_id" value={form.farm_id} onChange={fc} required disabled={farmLocked} className={inputCls}><option value="">Pilih Farm</option>{availableFarms.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}</select></FF>
              {form.farm_id && <FF label="Blok"><select name="block" value={form.block} onChange={fc} className={inputCls}><option value="">Pilih Blok</option>{blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}</select></FF>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Siklus Tanam"><input name="cycle" value={form.cycle} onChange={fc} required className={inputCls} /></FF>
              <FF label="Tgl Buka"><input type="date" name="opening_date" value={form.opening_date} onChange={fc} required className={inputCls} /></FF>
            </div>
            <FF label="Biaya Pembersihan (Rp)"><input type="number" name="clearing_cost" value={form.clearing_cost} onChange={fc} min="0" className={inputCls} /></FF>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} className={`${inputCls} resize-none`} /></FF>
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setModal(null)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold">Batal</button>
              <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'close' && (
        <Modal title="Tutup Lahan" onClose={() => setModal(null)}>
          <form onSubmit={handleClose} className="flex flex-col gap-4">
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-3">
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">{editTarget?.farm_master?.name || editTarget?.farm_id?.name || editTarget?.farm} — {editTarget?.cycle}</p>
            </div>
            <FF label="Tanggal Tutup"><input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} required className={inputCls} /></FF>
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setModal(null)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold">Batal</button>
              <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Konfirmasi Tutup'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PersiapanLahanPage;
