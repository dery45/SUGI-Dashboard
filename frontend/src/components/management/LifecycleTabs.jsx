import React, { useState, useEffect } from 'react';
import { useGenericResource } from '../../hooks/useGenericResource';
import { useAuth } from '../../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Badge = ({ status }) => {
  const map = {
    Open: 'bg-green-100 text-green-800',
    Closed: 'bg-gray-100 text-gray-600',
    Completed: 'bg-blue-100 text-blue-700',
    In_Progress: 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-orange-100 text-orange-700',
    Cancelled: 'bg-red-100 text-red-700',
    Planned: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const EmptyRow = ({ cols, label }) => (
  <tr>
    <td colSpan={cols} className="px-4 py-8 text-center text-gray-400 italic text-sm">{label}</td>
  </tr>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div className="bg-white rounded-t-2xl rounded-b-none sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 min-h-[52px]">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FF = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className={`w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${props.className || ''}`} />
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500">{children}</select>
);

const SaveBtn = ({ saving, label = 'Simpan', color = 'green' }) => {
  const colors = { green: 'bg-green-600 hover:bg-green-700', blue: 'bg-blue-600 hover:bg-blue-700', yellow: 'bg-yellow-600 hover:bg-yellow-700', orange: 'bg-orange-600 hover:bg-orange-700', emerald: 'bg-emerald-600 hover:bg-emerald-700' };
  return (
    <button type="submit" disabled={saving}
      className={`px-4 py-2 text-white rounded-lg font-medium text-sm shadow-sm disabled:opacity-50 transition-colors ${colors[color] || colors.green}`}>
      {saving ? 'Menyimpan...' : label}
    </button>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl rounded-b-none sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white min-h-[52px]">
          <h2 className="text-lg font-bold text-gray-800">Konfirmasi Hapus Data</h2>
          <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus data <strong>{itemName || 'ini'}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="min-h-[44px] px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm shadow-sm">Hapus Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function useBlocks(token, farmId) {
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    if (!farmId) { setBlocks([]); return; }
    fetch(`${BASE_URL}/master-data/blocks?farm=${farmId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setBlocks(j.data); }).catch(() => setBlocks([]));
  }, [farmId, token]);
  return blocks;
}

function FarmBlockSelects({ farms, farmLocked, form, onChange, blocks, includeBlok }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FF label="Farm" required>
        <Select name="farm_id" value={form.farm_id} onChange={onChange} required disabled={farmLocked}>
          <option value="">-- Pilih Farm --</option>
          {farms.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
        </Select>
      </FF>
      {includeBlok !== false && form.farm_id && (
        <FF label="Blok">
          <Select name="block" value={form.block || ''} onChange={onChange}>
            <option value="">-- Pilih Blok --</option>
            {blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
          </Select>
        </FF>
      )}
    </div>
  );
}

function useSection(endpoint, token) {
  const { data, loading, fetchData, createData, updateData, deleteData } = useGenericResource(endpoint, token);
  const records = Array.isArray(data) ? data : [];
  return { records, loading, fetchData, createData, updateData, deleteData };
}

// ─── 1. LAND PREPARATION ──────────────────────────────────────────────────────

const LandPrepSection = ({ showToast, farms: propFarms, farmLocked = false }) => {
  const { token } = useAuth();
  const { records, fetchData, createData, updateData, deleteData } = useSection('lifecycle/land', token);
  const farmsForFallback = propFarms && propFarms.length > 0 ? propFarms : [];
  const [localFarms, setLocalFarms] = useState([]);
  const farms = farmsForFallback.length > 0 ? farmsForFallback : localFarms;
  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (farmsForFallback.length > 0) return;
    fetch(`${BASE_URL}/master-data/farms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setLocalFarms(j.data); }).catch(() => {});
  }, [token, farmsForFallback.length]);

  const [form, setForm] = useState({ farm_id: '', block: '', cycle: '', opening_date: '', clearing_cost: '', notes: '' });
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [closingDate, setClosingDate] = useState('');
  const blocks = useBlocks(token, form.farm_id);
  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditTarget(null);
    setForm({ farm_id: farmLocked && farms[0] ? farms[0]._id : '', block: '', cycle: '', opening_date: new Date().toISOString().split('T')[0], clearing_cost: '', notes: '' });
    setModal('add');
  };
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ farm_id: r.farm_id?._id || r.farm_id || '', block: r.block?._id || r.block || '', cycle: r.cycle || '', opening_date: r.land_opening_date ? r.land_opening_date.split('T')[0] : '', clearing_cost: r.clearing_cost || '', notes: r.notes || '' });
    setModal('edit');
  };
  const openClose = (r) => {
    setEditTarget(r);
    setClosingDate(new Date().toISOString().split('T')[0]);
    setModal('close');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = { farm_id: form.farm_id, cycle: form.cycle, land_opening_date: form.opening_date, clearing_cost: +form.clearing_cost || 0, notes: form.notes, status: 'Open' };
    if (form.block) { payload.block = form.block; payload.farm_master = form.farm_id; }
    await createData(payload);
    showToast('Lahan baru berhasil dibuka!');
    setModal(null);
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const payload = { cycle: form.cycle, land_opening_date: form.opening_date, clearing_cost: +form.clearing_cost || 0, notes: form.notes };
    if (form.block) { payload.block = form.block; payload.farm_master = form.farm_id; }
    await updateData(editTarget._id, payload);
    showToast('Data lahan diperbarui!');
    setModal(null);
  };
  const handleClose = async (e) => {
    e.preventDefault();
    await updateData(editTarget._id, { land_closing_date: closingDate, status: 'Closed' });
    showToast('Lahan berhasil ditutup!');
    setModal(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Persiapan Lahan</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola pembukaan dan penutupan lahan pertanian</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shadow-sm font-medium">+ Buka Lahan Baru</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr><th className="px-4 py-3">Farm / Blok</th><th className="px-4 py-3">Siklus</th><th className="px-4 py-3">Tgl Buka</th><th className="px-4 py-3">Tgl Tutup</th><th className="px-4 py-3">Biaya (Rp)</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.length === 0 && <EmptyRow cols={7} label="Belum ada data lahan." />}
            {records.map(r => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.farm_master?.name || r.farm_id?.name || r.farm || '—'}{r.block?.name ? ` / ${r.block.name}` : ''}</td>
                <td className="px-4 py-3 text-gray-500">{r.cycle}</td>
                <td className="px-4 py-3">{r.land_opening_date ? new Date(r.land_opening_date).toLocaleDateString('id-ID') : '—'}</td>
                <td className="px-4 py-3">{r.land_closing_date ? new Date(r.land_closing_date).toLocaleDateString('id-ID') : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">{r.clearing_cost ? `Rp ${Number(r.clearing_cost).toLocaleString('id-ID')}` : '—'}</td>
                <td className="px-4 py-3"><Badge status={r.status} /></td>
                <td className="px-4 py-3 flex items-center gap-2 flex-wrap">
                  <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                  {r.status === 'Open' && <button onClick={() => openClose(r)} className="text-xs text-orange-600 hover:text-orange-800 font-semibold border border-orange-300 px-2 py-0.5 rounded">Tutup</button>}
                  <button onClick={() => setDeleteTarget({ id: r._id, name: r.farm_master?.name || r.farm_id?.name || r.farm })} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal === 'add' && (
        <Modal title="Buka Lahan Baru" onClose={() => setModal(null)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <FarmBlockSelects farms={farms} farmLocked={farmLocked} form={form} onChange={fc} blocks={blocks} />
            <div className="grid grid-cols-2 gap-4">
              <FF label="Siklus Tanam" required><Input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" /></FF>
              <FF label="Tgl Buka" required><Input type="date" name="opening_date" value={form.opening_date} onChange={fc} required /></FF>
            </div>
            <FF label="Biaya Pembersihan (Rp)"><Input type="number" name="clearing_cost" value={form.clearing_cost} onChange={fc} min="0" placeholder="0" /></FF>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Catatan tambahan..." /></FF>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <SaveBtn label="Buka Lahan" />
            </div>
          </form>
        </Modal>
      )}
      {modal === 'edit' && (
        <Modal title="Edit Data Lahan" onClose={() => setModal(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <FarmBlockSelects farms={farms} farmLocked={farmLocked} form={form} onChange={fc} blocks={blocks} />
            <div className="grid grid-cols-2 gap-4">
              <FF label="Siklus Tanam" required><Input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" /></FF>
              <FF label="Tgl Buka" required><Input type="date" name="opening_date" value={form.opening_date} onChange={fc} required /></FF>
            </div>
            <FF label="Biaya Pembersihan (Rp)"><Input type="number" name="clearing_cost" value={form.clearing_cost} onChange={fc} min="0" placeholder="0" /></FF>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Catatan tambahan..." /></FF>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <SaveBtn label="Simpan Perubahan" />
            </div>
          </form>
        </Modal>
      )}
      {modal === 'close' && (
        <Modal title="Tutup Lahan" onClose={() => setModal(null)}>
          <form onSubmit={handleClose} className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800 font-semibold">{editTarget?.farm_master?.name || editTarget?.farm_id?.name || editTarget?.farm} — {editTarget?.cycle}</p>
            </div>
            <FF label="Tanggal Tutup" required><Input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} required /></FF>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-sm">Konfirmasi Tutup</button>
            </div>
          </form>
        </Modal>
      )}
      <DeleteConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteData(deleteTarget.id); showToast('Data lahan dihapus.'); }} itemName={deleteTarget?.name} />
    </div>
  );
};

// ─── 2. PLANTING ──────────────────────────────────────────────────────────────

const PLANTING_STATUSES = ['Planned', 'In_Progress', 'Completed', 'Cancelled'];

const PlantingSection = ({ showToast, farms: propFarms, farmLocked = false }) => {
  const { token } = useAuth();
  const { records, fetchData, createData, updateData, deleteData } = useSection('lifecycle/plantings', token);
  const farmsForFallback = propFarms && propFarms.length > 0 ? propFarms : [];
  const [localFarms, setLocalFarms] = useState([]);
  const farms = farmsForFallback.length > 0 ? farmsForFallback : localFarms;
  const [cropTypes, setCropTypes] = useState([]);
  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const h = { headers: { Authorization: `Bearer ${token}` } };
    if (farmsForFallback.length === 0) {
      fetch(`${BASE_URL}/master-data/farms`, h).then(r => r.json()).then(j => { if (j.success) setLocalFarms(j.data); }).catch(() => {});
    }
    fetch(`${BASE_URL}/master-data/crop-types`, h).then(r => r.json()).then(j => { if (j.success) setCropTypes(j.data); }).catch(() => {});
  }, [token, farmsForFallback.length]);

  const [form, setForm] = useState({ farm_id: '', block: '', cycle: '', crop_type: '', variety: '', planting_date: '', area_ha: '', seedling_count: '', executor: '', status: 'Planned', notes: '' });
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const blocks = useBlocks(token, form.farm_id);
  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditTarget(null);
    setForm({ farm_id: farmLocked && farms[0] ? farms[0]._id : '', block: '', cycle: '', crop_type: '', variety: '', planting_date: new Date().toISOString().split('T')[0], area_ha: '', seedling_count: '', executor: '', status: 'Planned', notes: '' });
    setModal('form');
  };
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ farm_id: r.farm_id?._id || r.farm_id || '', block: r.block?._id || r.block || '', cycle: r.cycle || '', crop_type: r.crop_type || '', variety: r.variety || '', planting_date: r.planting_date ? r.planting_date.split('T')[0] : '', area_ha: r.area_ha || '', seedling_count: r.seedling_count || '', executor: r.executor || '', status: r.status || 'Planned', notes: r.notes || '' });
    setModal('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entry = { farm_id: form.farm_id, cycle: form.cycle, crop_type: form.crop_type, crop_type_ref: form.crop_type, variety: form.variety, planting_date: form.planting_date, area_ha: +form.area_ha || 0, seedling_count: +form.seedling_count || 0, executor: form.executor, status: form.status, notes: form.notes, farm_master: form.farm_id };
    if (form.block) entry.block = form.block;
    if (editTarget) {
      await updateData(editTarget._id, entry);
      showToast('Data penanaman diperbarui!');
    } else {
      await createData(entry);
      showToast('Aktivitas penanaman baru ditambahkan!');
    }
    setModal(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Log Penanaman</h3>
          <p className="text-xs text-gray-400 mt-0.5">Catat aktivitas penanaman bibit per blok lahan</p>
        </div>
        <button onClick={openAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 shadow-sm font-medium">+ Tambah Penanaman</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr><th className="px-4 py-3">Farm / Blok</th><th className="px-4 py-3">Siklus</th><th className="px-4 py-3">Tanaman</th><th className="px-4 py-3">Tgl Tanam</th><th className="px-4 py-3">Luas (Ha)</th><th className="px-4 py-3">Bibit</th><th className="px-4 py-3">Pelaksana</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.length === 0 && <EmptyRow cols={9} label="Belum ada data penanaman." />}
            {records.map(r => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.farm_master?.name || r.farm_id?.name || r.farm || '—'}{r.block?.name ? ` / ${r.block.name}` : ''}</td>
                <td className="px-4 py-3 text-gray-500">{r.cycle}</td>
                <td className="px-4 py-3">{r.crop_type_ref?.name || r.crop_type}{r.variety ? ` (${r.variety})` : ''}</td>
                <td className="px-4 py-3">{r.planting_date ? new Date(r.planting_date).toLocaleDateString('id-ID') : '—'}</td>
                <td className="px-4 py-3">{r.area_ha} ha</td>
                <td className="px-4 py-3">{r.seedling_count?.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-gray-500">{r.executor}</td>
                <td className="px-4 py-3"><Badge status={r.status} /></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                  <button onClick={() => setDeleteTarget({ id: r._id, name: r.farm_master?.name || r.farm_id?.name || r.farm })} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal === 'form' && (
        <Modal title={editTarget ? 'Edit Data Penanaman' : 'Tambah Penanaman Baru'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FarmBlockSelects farms={farms} farmLocked={farmLocked} form={form} onChange={fc} blocks={blocks} />
            <div className="grid grid-cols-2 gap-4">
              <FF label="Siklus Tanam" required><Input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" /></FF>
              <FF label="Jenis Tanaman" required>
                <Select name="crop_type" value={form.crop_type} onChange={fc} required>
                  <option value="">-- Pilih --</option>
                  {cropTypes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </Select>
              </FF>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Varietas"><Input name="variety" value={form.variety} onChange={fc} placeholder="DxP, Arabika, dll" /></FF>
              <FF label="Tanggal Tanam" required><Input type="date" name="planting_date" value={form.planting_date} onChange={fc} required /></FF>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Luas Area (Ha)" required><Input type="number" name="area_ha" value={form.area_ha} onChange={fc} required step="0.1" min="0" placeholder="5.0" /></FF>
              <FF label="Jumlah Bibit"><Input type="number" name="seedling_count" value={form.seedling_count} onChange={fc} min="0" placeholder="0" /></FF>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Pelaksana"><Input name="executor" value={form.executor} onChange={fc} placeholder="Nama petani/UM" /></FF>
              <FF label="Status">
                <Select name="status" value={form.status} onChange={fc}>
                  {PLANTING_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </Select>
              </FF>
            </div>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Catatan tambahan..." /></FF>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <SaveBtn label={editTarget ? 'Simpan Perubahan' : 'Tambah Penanaman'} color="emerald" />
            </div>
          </form>
        </Modal>
      )}
      <DeleteConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteData(deleteTarget.id); showToast('Data penanaman dihapus.'); }} itemName={deleteTarget?.name} />
    </div>
  );
};

// ─── 3. MAINTENANCE ────────────────────────────────────────────────────────────

const MaintenanceSection = ({ showToast, farms: propFarms, farmLocked = false }) => {
  const { token } = useAuth();
  const { records, fetchData, createData, updateData, deleteData } = useSection('lifecycle/activities', token);
  const farmsForFallback = propFarms && propFarms.length > 0 ? propFarms : [];
  const [localFarms, setLocalFarms] = useState([]);
  const farms = farmsForFallback.length > 0 ? farmsForFallback : localFarms;
  const [activityTypes, setActivityTypes] = useState([]);
  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const h = { headers: { Authorization: `Bearer ${token}` } };
    if (farmsForFallback.length === 0) {
      fetch(`${BASE_URL}/master-data/farms`, h).then(r => r.json()).then(j => { if (j.success) setLocalFarms(j.data); }).catch(() => {});
    }
    fetch(`${BASE_URL}/master-data/activity-types`, h).then(r => r.json()).then(j => { if (j.success) setActivityTypes(j.data); }).catch(() => {});
  }, [token, farmsForFallback.length]);

  const [form, setForm] = useState({ farm_id: '', block: '', cycle: '', activity_type: '', description: '', date: '', labor_hours: '', cost: '', executor: '', status: 'Pending' });
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('');
  const blocks = useBlocks(token, form.farm_id);
  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const filtered = filter ? records.filter(r => (r.activity_type_ref?._id || r.activity_type) === filter) : records;
  const totalCost = records.reduce((s, r) => s + Number(r.cost || 0), 0);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ farm_id: farmLocked && farms[0] ? farms[0]._id : '', block: '', cycle: '', activity_type: '', description: '', date: new Date().toISOString().split('T')[0], labor_hours: '', cost: '', executor: '', status: 'Pending' });
    setModal('form');
  };
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ farm_id: r.farm_id?._id || r.farm_id || '', block: r.block?._id || r.block || '', cycle: r.cycle || '', activity_type: r.activity_type || '', description: r.description || '', date: r.date ? r.date.split('T')[0] : '', labor_hours: r.labor_hours || '', cost: r.cost || '', executor: r.executor || '', status: r.status || 'Pending' });
    setModal('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entry = { farm_id: form.farm_id, cycle: form.cycle, activity_type: form.activity_type, activity_type_ref: form.activity_type, description: form.description, date: form.date, labor_hours: +form.labor_hours || 0, cost: +form.cost || 0, executor: form.executor, status: form.status, farm_master: form.farm_id };
    if (form.block) entry.block = form.block;
    if (editTarget) {
      await updateData(editTarget._id, entry);
      showToast('Data perawatan diperbarui!');
    } else {
      await createData(entry);
      showToast('Aktivitas perawatan baru ditambahkan!');
    }
    setModal(null);
  };

  const handleStatusChange = async (id, status) => {
    await updateData(id, { status });
    showToast('Status diperbarui!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Log Perawatan</h3>
          <p className="text-xs text-gray-400 mt-0.5">Catat aktivitas pemeliharaan tanaman</p>
        </div>
        <button onClick={openAdd} className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 shadow-sm font-medium">+ Tambah Aktivitas</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total Aktivitas</p>
          <p className="text-2xl font-black text-blue-800">{records.length}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 font-semibold uppercase">Total Jam</p>
          <p className="text-2xl font-black text-green-800">{records.reduce((s, r) => s + Number(r.labor_hours || 0), 0)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
          <p className="text-xs text-red-600 font-semibold uppercase">Total Biaya</p>
          <p className="text-xl font-black text-red-800">Rp {totalCost.toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${!filter ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Semua</button>
        {activityTypes.map(a => (
          <button key={a._id} onClick={() => setFilter(filter === a._id ? '' : a._id)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === a._id ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{a.name}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr><th className="px-4 py-3">Farm / Blok</th><th className="px-4 py-3">Siklus</th><th className="px-4 py-3">Jenis</th><th className="px-4 py-3">Deskripsi</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Jam</th><th className="px-4 py-3">Biaya</th><th className="px-4 py-3">Pelaksana</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 && <EmptyRow cols={10} label="Tidak ada aktivitas ditemukan." />}
            {filtered.map(r => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.farm_master?.name || r.farm_id?.name || r.farm || '—'}{r.block?.name ? ` / ${r.block.name}` : ''}</td>
                <td className="px-4 py-3 text-gray-500">{r.cycle}</td>
                <td className="px-4 py-3">
                  <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded">
                    {r.activity_type_ref?.name || activityTypes.find(a => a._id === r.activity_type)?.name || r.activity_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{r.description}</td>
                <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleDateString('id-ID') : '—'}</td>
                <td className="px-4 py-3">{r.labor_hours}j</td>
                <td className="px-4 py-3">Rp {Number(r.cost).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-gray-500">{r.executor}</td>
                <td className="px-4 py-3">
                  <select value={r.status} onChange={e => handleStatusChange(r._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 outline-none">
                    <option value="Pending">Pending</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                  <button onClick={() => setDeleteTarget({ id: r._id, name: `${r.farm_master?.name || r.farm_id?.name || ''} - ${r.activity_type_ref?.name || activityTypes.find(a => a._id === r.activity_type)?.name || r.activity_type}` })} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal === 'form' && (
        <Modal title={editTarget ? 'Edit Aktivitas Perawatan' : 'Tambah Aktivitas Perawatan'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FarmBlockSelects farms={farms} farmLocked={farmLocked} form={form} onChange={fc} blocks={blocks} />
            <div className="grid grid-cols-2 gap-4">
              <FF label="Siklus Tanam"><Input name="cycle" value={form.cycle} onChange={fc} placeholder="Sawit 2026" /></FF>
              <FF label="Jenis Aktivitas" required>
                <Select name="activity_type" value={form.activity_type} onChange={fc} required>
                  <option value="">-- Pilih --</option>
                  {activityTypes.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </Select>
              </FF>
            </div>
            <FF label="Deskripsi"><Input name="description" value={form.description} onChange={fc} placeholder="Detail kegiatan..." /></FF>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Tanggal" required><Input type="date" name="date" value={form.date} onChange={fc} required /></FF>
              <FF label="Jam Kerja"><Input type="number" name="labor_hours" value={form.labor_hours} onChange={fc} min="0" step="0.5" placeholder="0" /></FF>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Biaya (Rp)"><Input type="number" name="cost" value={form.cost} onChange={fc} min="0" placeholder="0" /></FF>
              <FF label="Pelaksana"><Input name="executor" value={form.executor} onChange={fc} placeholder="Nama petani/UM" /></FF>
            </div>
            <FF label="Status">
              <Select name="status" value={form.status} onChange={fc}>
                {['Pending', 'In_Progress', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </Select>
            </FF>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <SaveBtn label={editTarget ? 'Simpan Perubahan' : 'Tambah Aktivitas'} color="yellow" />
            </div>
          </form>
        </Modal>
      )}
      <DeleteConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteData(deleteTarget.id); showToast('Data perawatan dihapus.'); }} itemName={deleteTarget?.name} />
    </div>
  );
};

// ─── 4. HARVESTING ─────────────────────────────────────────────────────────────

const HarvestingSection = ({ showToast, farms: propFarms, farmLocked = false }) => {
  const { token } = useAuth();
  const { records, fetchData, createData, updateData, deleteData } = useSection('lifecycle/harvests', token);
  const farmsForFallback = propFarms && propFarms.length > 0 ? propFarms : [];
  const [localFarms, setLocalFarms] = useState([]);
  const farms = farmsForFallback.length > 0 ? farmsForFallback : localFarms;
  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (farmsForFallback.length > 0) return;
    fetch(`${BASE_URL}/master-data/farms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setLocalFarms(j.data); }).catch(() => {});
  }, [token, farmsForFallback.length]);

  const [form, setForm] = useState({ farm_id: '', block: '', cycle: '', opening_date: '', expected_end: '', expected_yield_kg: '', notes: '' });
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [yieldInput, setYieldInput] = useState('');
  const blocks = useBlocks(token, form.farm_id);
  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditTarget(null);
    setForm({ farm_id: farmLocked && farms[0] ? farms[0]._id : '', block: '', cycle: '', opening_date: new Date().toISOString().split('T')[0], expected_end: '', expected_yield_kg: '', notes: '' });
    setModal('form');
  };
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ farm_id: r.farm_id?._id || r.farm_id || '', block: r.block?._id || r.block || '', cycle: r.cycle || '', opening_date: r.harvest_opening_date ? r.harvest_opening_date.split('T')[0] : '', expected_end: r.expected_end ? r.expected_end.split('T')[0] : '', expected_yield_kg: r.expected_yield_kg || '', notes: r.notes || '' });
    setModal('form');
  };
  const openClose = (r) => {
    setEditTarget(r);
    setYieldInput(r.actual_yield_kg || '');
    setModal('close');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entry = { farm_id: form.farm_id, cycle: form.cycle, harvest_opening_date: form.opening_date, expected_end: form.expected_end, expected_yield_kg: +form.expected_yield_kg || 0, notes: form.notes };
    if (form.block) { entry.block = form.block; entry.farm_master = form.farm_id; }
    if (editTarget) {
      await updateData(editTarget._id, entry);
      showToast('Data panen diperbarui!');
    } else {
      await createData(entry);
      showToast('Masa panen baru dibuka!');
    }
    setModal(null);
  };
  const handleClose = async (e) => {
    e.preventDefault();
    await updateData(editTarget._id, { actual_yield_kg: +yieldInput || 0, status: 'Closed' });
    showToast('Masa panen ditutup!');
    setModal(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Manajemen Panen</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola masa panen dan hasil produksi</p>
        </div>
        <button onClick={openAdd} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 shadow-sm font-medium">+ Buka Masa Panen</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr><th className="px-4 py-3">Farm / Blok</th><th className="px-4 py-3">Siklus</th><th className="px-4 py-3">Tgl Buka</th><th className="px-4 py-3">Est. Akhir</th><th className="px-4 py-3">Target (Kg)</th><th className="px-4 py-3">Aktual (Kg)</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.length === 0 && <EmptyRow cols={8} label="Belum ada data panen." />}
            {records.map(r => {
              const daysLeft = r.expected_end && r.status === 'Open' ? Math.ceil((new Date(r.expected_end) - new Date()) / (1000 * 60 * 60 * 24)) : null;
              const isOverdue = daysLeft !== null && daysLeft < 0;
              const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
              return (
                <tr key={r._id} className={`hover:bg-gray-50 transition ${isOverdue ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.farm_master?.name || r.farm_id?.name || r.farm || '—'}{r.block?.name ? ` / ${r.block.name}` : ''}</td>
                  <td className="px-4 py-3 text-gray-500">{r.cycle}</td>
                  <td className="px-4 py-3">{r.harvest_opening_date ? new Date(r.harvest_opening_date).toLocaleDateString('id-ID') : '—'}</td>
                  <td className="px-4 py-3">{r.expected_end ? new Date(r.expected_end).toLocaleDateString('id-ID') : '—'}</td>
                  <td className="px-4 py-3">{r.expected_yield_kg?.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{r.actual_yield_kg != null ? r.actual_yield_kg.toLocaleString('id-ID') : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3 flex items-center gap-2 flex-wrap">
                    <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                    {r.status === 'Open' && <button onClick={() => openClose(r)} className="text-xs text-orange-600 hover:text-orange-800 font-semibold border border-orange-300 px-2 py-0.5 rounded">Tutup</button>}
                    <button onClick={() => setDeleteTarget({ id: r._id, name: r.farm_master?.name || r.farm_id?.name || r.farm })} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal === 'form' && (
        <Modal title={editTarget ? 'Edit Data Panen' : 'Buka Masa Panen Baru'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FarmBlockSelects farms={farms} farmLocked={farmLocked} form={form} onChange={fc} blocks={blocks} />
            <div className="grid grid-cols-2 gap-4">
              <FF label="Siklus Tanam" required><Input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" /></FF>
              <FF label="Tgl Mulai Panen" required><Input type="date" name="opening_date" value={form.opening_date} onChange={fc} required /></FF>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FF label="Estimasi Selesai" required><Input type="date" name="expected_end" value={form.expected_end} onChange={fc} required /></FF>
              <FF label="Target Hasil (Kg)"><Input type="number" name="expected_yield_kg" value={form.expected_yield_kg} onChange={fc} min="0" placeholder="5000" /></FF>
            </div>
            <FF label="Catatan"><textarea name="notes" value={form.notes} onChange={fc} rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Catatan tambahan..." /></FF>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <SaveBtn label={editTarget ? 'Simpan Perubahan' : 'Konfirmasi Buka Panen'} color="orange" />
            </div>
          </form>
        </Modal>
      )}
      {modal === 'close' && (
        <Modal title="Tutup Masa Panen" onClose={() => setModal(null)}>
          <form onSubmit={handleClose} className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800 font-semibold">{editTarget?.farm_master?.name || editTarget?.farm_id?.name || editTarget?.farm} — {editTarget?.cycle}</p>
              <p className="text-xs text-orange-600 mt-0.5">Target: {editTarget?.expected_yield_kg?.toLocaleString('id-ID')} kg</p>
            </div>
            <FF label="Hasil Panen Aktual (Kg)" required>
              <Input type="number" value={yieldInput} onChange={e => setYieldInput(e.target.value)} required min="0" placeholder="0" />
            </FF>
            {yieldInput && editTarget?.expected_yield_kg && (
              <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${+yieldInput >= editTarget.expected_yield_kg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {+yieldInput >= editTarget.expected_yield_kg
                  ? `Melebihi target sebesar ${(+yieldInput - editTarget.expected_yield_kg).toLocaleString('id-ID')} kg`
                  : `Di bawah target sebesar ${(editTarget.expected_yield_kg - +yieldInput).toLocaleString('id-ID')} kg`}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-sm">Konfirmasi Tutup Panen</button>
            </div>
          </form>
        </Modal>
      )}
      <DeleteConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteData(deleteTarget.id); showToast('Data panen dihapus.'); }} itemName={deleteTarget?.name} />
    </div>
  );
};

// ─── Main LifecycleTabs ────────────────────────────────────────────────────────

const STAGES = [
  { id: 'Land_Prep', name: 'Persiapan Lahan', icon: '🌿', color: 'blue' },
  { id: 'Planting', name: 'Penanaman', icon: '🌱', color: 'emerald' },
  { id: 'Maintenance', name: 'Perawatan', icon: '🔧', color: 'yellow' },
  { id: 'Harvesting', name: 'Panen', icon: '🌾', color: 'orange' },
];

const LifecycleTabs = ({ availableFarms, farmLocked }) => {
  const [stage, setStage] = useState('Land_Prep');
  const [notification, setNotification] = useState(null);
  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {notification}
        </div>
      )}
      <div className="w-full md:w-1/5 flex-shrink-0">
        <div className="bg-gray-50 rounded-xl p-2 flex flex-col gap-1">
          {STAGES.map(s => (
            <button key={s.id} onClick={() => setStage(s.id)}
              className={`flex items-center gap-3 text-left px-4 py-3.5 rounded-lg text-sm font-medium transition ${
                stage === s.id ? 'bg-white shadow text-gray-800 border border-gray-200' : 'text-gray-500 hover:bg-white hover:text-gray-700'
              }`}>
              <span className="text-base">{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {stage === 'Land_Prep' && <LandPrepSection showToast={showToast} farms={availableFarms} farmLocked={farmLocked} />}
        {stage === 'Planting' && <PlantingSection showToast={showToast} farms={availableFarms} farmLocked={farmLocked} />}
        {stage === 'Maintenance' && <MaintenanceSection showToast={showToast} farms={availableFarms} farmLocked={farmLocked} />}
        {stage === 'Harvesting' && <HarvestingSection showToast={showToast} farms={availableFarms} farmLocked={farmLocked} />}
      </div>
    </div>
  );
};

export default LifecycleTabs;
