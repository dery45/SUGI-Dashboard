import React, { useState, useEffect } from 'react';
import { useGenericResource } from './hooks/useGenericResource';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL as BASE_URL } from '@/services/authService';
import Card from '@/component/common/Card';
import DataTable from '@/component/common/DataTable';
import ViewDetailModal from '@/component/common/ViewDetailModal';
import { Badge } from '@/utils/statusLabels';
import { useToast } from '@/contexts/ToastContext';
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

function useEligibleCycles(token) {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${BASE_URL}/lifecycle/cycles/eligible?stage=harvest`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setCycles(j.data || []); }).catch(() => setCycles([]))
      .finally(() => setLoading(false));
  }, [token]);
  return { cycles, loading };
}
const cycleLabel = c => {
  const farmName = c?.farm_master?.name || c?.farm_id?.name || '';
  const blockName = c?.block?.name ? ` / ${c.block.name}` : '';
  return `${c?.cycle || '(tanpa siklus)'} — ${farmName}${blockName}`;
};

const PanenPage = () => {
  const { token } = useAuth();
  const { data, loading, error, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/harvests', token);
  const records = Array.isArray(data) ? data : [];
  const { cycles, loading: cyclesLoading } = useEligibleCycles(token);
  const [farms, setFarms] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [filterFarm, setFilterFarm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/master-data/farms/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(j=>{ if(j.success) setFarms(j.data); }).catch(()=>{});
    fetch(`${BASE_URL}/master-data/blocks/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(j=>{ if(j.success) setAllBlocks(j.data); }).catch(()=>{});
  }, [token]);
  const filteredCycles = cycles.filter(c => {
    const fId = (c.farm_master?._id || c.farm_id?._id || c.farm_master || c.farm_id)?.toString?.();
    const bId = (c.block?._id || c.block)?.toString?.();
    if (filterFarm && fId !== filterFarm) return false;
    if (filterBlock && bId !== filterBlock) return false;
    return true;
  });
  const blocksForFarm = filterFarm ? allBlocks.filter(b => (b.farm?._id || b.farm)?.toString() === filterFarm) : allBlocks;
  useEffect(() => { fetchData(); }, [fetchData]);
  const [form, setForm] = useState({ crop_cycle_id: '', opening_date: '', expected_end: '', expected_yield_kg: '', notes: '' });
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [yieldInput, setYieldInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const { showToast } = useToast();
  const fc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const columns = [
    { header: 'Farm / Blok', accessor: r => `${r.farm_master?.name || r.farm_id?.name || '-'}${r.block?.name ? ` / ${r.block.name}` : ''}` },
    { header: 'Siklus', accessor: 'cycle' },
    { header: 'Tgl Buka', accessor: r => r.harvest_opening_date ? new Date(r.harvest_opening_date).toLocaleDateString('id-ID') : '-' },
    { header: 'Est. Selesai', accessor: r => r.expected_end ? new Date(r.expected_end).toLocaleDateString('id-ID') : '-' },
    { header: 'Target (Kg)', accessor: r => (r.expected_yield_kg != null ? r.expected_yield_kg.toLocaleString('id-ID') : '-') },
    { header: 'Aktual (Kg)', accessor: r => (r.actual_yield_kg != null ? <span className="font-semibold text-emerald-600">{r.actual_yield_kg.toLocaleString('id-ID')}</span> : '-') },
    { header: 'Status', accessor: r => <Badge status={r.status} /> },
  ];

  const openAdd = () => { setEditTarget(null); setForm({ crop_cycle_id: '', opening_date: new Date().toISOString().split('T')[0], expected_end: '', expected_yield_kg: '', notes: '' }); setModal('form'); };
  const openEdit = r => {
    if (isLocked(r)) { showToast(LOCK_MSG); return; }
    setEditTarget(r);
    setForm({
      crop_cycle_id: r.crop_cycle_id?._id || r.crop_cycle_id || '',
      opening_date: r.harvest_opening_date ? r.harvest_opening_date.split('T')[0] : '',
      expected_end: r.expected_end ? r.expected_end.split('T')[0] : '',
      expected_yield_kg: r.expected_yield_kg ?? '', notes: r.notes || '',
    });
    setModal('form');
  };
  const openClose = r => { setEditTarget(r); setYieldInput(r.actual_yield_kg ?? ''); setModal('close'); };
  const openView = r => { setViewModal(r); };
  const isLocked = r => r.status === 'Closed' || r.status === 'Completed';
  const LOCK_MSG = 'Masa panen sudah ditutup — data Panen terkunci.';

  const handleSubmit = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try {
      const entry = {
        crop_cycle_id: form.crop_cycle_id,
        harvest_opening_date: form.opening_date, expected_end: form.expected_end,
        expected_yield_kg: +form.expected_yield_kg || 0, notes: form.notes,
      };
      if (form.farm_master) entry.farm_master = form.farm_master;
      if (form.block) entry.block = form.block;
      if (editTarget) { await updateData(editTarget._id, entry); showToast('Data panen diperbarui!'); }
      else { await createData(entry); showToast('Masa panen baru dibuka!'); }
      setModal(null); fetchData();
    } finally { setSaving(false); }
  };
  const handleClose = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try {
      await updateData(editTarget._id, { actual_yield_kg: +yieldInput || 0, status: 'Closed' });
      // Cascading closure (frontend-only, Phase 4c Task 3): closing the Panen
      // auto-fills the cycle's Persiapan Lahan Tgl Tutup + status Tertutup.
      // Fires immediately at close-time (not on next load). UI lock only —
      // no new backend authorization for this rule by design.
      try {
        const cycleId = editTarget?.crop_cycle_id?._id || editTarget?.crop_cycle_id;
        const lands = await fetch(`${BASE_URL}/lifecycle/land`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        const landRec = (lands.data || []).find(l => (l.crop_cycle_id?._id || l.crop_cycle_id) === cycleId);
        if (landRec) {
          await fetch(`${BASE_URL}/lifecycle/land/${landRec._id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ land_closing_date: new Date().toISOString().split('T')[0], status: 'Closed' }),
          });
        }
      } catch { /* cascade best-effort; panen close already succeeded */ }
      showToast('Masa panen ditutup! Siklus selesai — tahapan terkait terkunci.');
      setModal(null); fetchData();
    } finally { setSaving(false); }
  };

  if (error && (error.includes('403') || error.includes('Akses'))) {
    return <Card title="Panen"><p className="p-6 text-center text-sm font-semibold text-destructive">{error}</p><p className="pb-6 text-center text-xs text-muted -mt-2">Hubungi Owner Anda untuk mendapatkan akses tahap ini.</p></Card>;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Panen</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola masa panen dan hasil produksi</p>
          </div>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-bold text-xs uppercase tracking-wider min-h-[44px]">+ Buka Masa Panen</button>
      </div>

      <Card title="Manajemen Panen">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={records}
              onView={openView}
              onEdit={openEdit}
              onDelete={id => { const rec = records.find(r => r._id === id); if (rec && isLocked(rec)) { showToast(LOCK_MSG); return; } if (confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) { deleteData(id); showToast('Data panen dihapus.'); } }}
              editCondition={r => !isLocked(r)}
              deleteCondition={r => !isLocked(r)}
              itemsPerPage={10}
            />
            {/* Tutup action for Open rows */}
            <div className="mt-3 flex flex-wrap gap-2">
              {records.filter(r => r.status === 'Open').map(r => (
                <button key={r._id} onClick={() => openClose(r)} className="text-xs px-3 py-1.5 rounded-full font-semibold border border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                  Tutup: {r.cycle} ({(r.farm_master?.name || r.farm_id?.name || '')})
                </button>
              ))}
            </div>
          </>
        )}
      </Card>

      {modal === 'form' && (
        <Modal title={editTarget ? 'Ubah Data Panen' : 'Buka Masa Panen Baru'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FF label="Filter Farm"><select value={filterFarm} onChange={e=>{setFilterFarm(e.target.value); setFilterBlock('');}} className={inputCls}><option value="">Semua Farm</option>{farms.map(f=> <option key={f._id} value={f._id}>{f.name}</option>)}</select></FF>
              <FF label="Filter Blok"><select value={filterBlock} onChange={e=>setFilterBlock(e.target.value)} className={inputCls}><option value="">Semua Blok</option>{blocksForFarm.map(b=> <option key={b._id} value={b._id}>{b.name}</option>)}</select></FF>
            </div>
            <FF label="Siklus Tanam">
              <select name="crop_cycle_id" value={form.crop_cycle_id} onChange={fc} required disabled={!!editTarget} className={inputCls}>
                <option value="">{cyclesLoading ? 'Memuat siklus...' : '-- Pilih Siklus Tanam --'}</option>
                {filteredCycles.map(c => <option key={c._id} value={c._id}>{cycleLabel(c)}</option>)}
              </select>
              <p className="text-[10px] text-muted italic">Menampilkan {filteredCycles.length} dari {cycles.length} siklus (isolasi per Blok)</p>
            </FF>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Tgl Mulai Panen"><input type="date" name="opening_date" value={form.opening_date} onChange={fc} required className={inputCls} /></FF>
              <FF label="Estimasi Selesai"><input type="date" name="expected_end" value={form.expected_end} onChange={fc} required className={inputCls} /></FF>
            </div>
            <FF label="Target Hasil (Kg)"><input type="number" name="expected_yield_kg" value={form.expected_yield_kg} onChange={fc} min="0" placeholder="5000" className={inputCls} /></FF>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} placeholder="Catatan tambahan..." className={`${inputCls} resize-none`} /></FF>
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setModal(null)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold">Batal</button>
              <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50">{saving ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Konfirmasi Buka Panen')}</button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'close' && (
        <Modal title="Tutup Masa Panen" onClose={() => setModal(null)}>
          <form onSubmit={handleClose} className="flex flex-col gap-4">
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-3">
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">{editTarget?.farm_master?.name || editTarget?.farm_id?.name || editTarget?.farm} — {editTarget?.cycle}</p>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">Target: {(editTarget?.expected_yield_kg ?? 0).toLocaleString('id-ID')} kg</p>
            </div>
            <FF label="Hasil Panen Aktual (Kg)"><input type="number" value={yieldInput} onChange={e => setYieldInput(e.target.value)} required min="0" placeholder="0" className={inputCls} /></FF>
            {yieldInput !== '' && editTarget?.expected_yield_kg > 0 && (
              <div className={`text-xs font-semibold px-3 py-2 rounded-xl ${+yieldInput >= editTarget.expected_yield_kg ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                {+yieldInput >= editTarget.expected_yield_kg
                  ? `Melebihi target sebesar ${(+yieldInput - editTarget.expected_yield_kg).toLocaleString('id-ID')} kg`
                  : `Di bawah target sebesar ${(editTarget.expected_yield_kg - +yieldInput).toLocaleString('id-ID')} kg`}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setModal(null)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold">Batal</button>
              <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Konfirmasi Tutup Panen'}</button>
            </div>
          </form>
        </Modal>
      )}
      {viewModal && (
        <ViewDetailModal
          isOpen={!!viewModal}
          onClose={() => setViewModal(null)}
          record={viewModal}
          columns={columns}
          title="Detail Panen"
        />
      )}
    </div>
  );
};

export default PanenPage;
