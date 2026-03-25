import React, { useState } from 'react';

// ─── Initial Data ─────────────────────────────────────────────────────────────

const FARMS = [
  { id: 'farm_1', name: 'Blok A - Sumatra' },
  { id: 'farm_2', name: 'Blok B - Kalimantan' },
  { id: 'farm_3', name: 'Blok C - Sulawesi' },
];

const initialLandRecords = [
  { id: 1, farm: 'Blok A - Sumatra',    farm_id: 'farm_1', cycle: 'Sawit 2026', opening_date: '2026-03-01', closing_date: null, clearing_cost: 5000000, status: 'Open',   notes: 'Pembersihan selesai' },
  { id: 2, farm: 'Blok B - Kalimantan', farm_id: 'farm_2', cycle: 'Sawit 2026', opening_date: '2026-02-15', closing_date: '2026-03-15', clearing_cost: 3500000, status: 'Closed', notes: 'Siap penanaman' },
];

const initialPlantings = [
  { id: 1, farm: 'Blok A - Sumatra',    cycle: 'Sawit 2026', crop_type: 'Kelapa Sawit', variety: 'DxP Simalungun', planting_date: '2026-03-10', area_ha: 5.2, seedling_count: 745, executor: 'Budi Santoso', status: 'Completed', notes: 'Sesuai jadwal' },
  { id: 2, farm: 'Blok C - Sulawesi',   cycle: 'Kopi 2026',  crop_type: 'Kopi', variety: 'Arabika Gayo', planting_date: '2026-03-18', area_ha: 2.5, seedling_count: 312, executor: 'Siti Aminah', status: 'In_Progress', notes: '' },
];

const initialMaintenances = [
  { id: 1, farm: 'Blok A - Sumatra',    cycle: 'Sawit 2026', activity_type: 'Fertilizing', description: 'Pemupukan NPK 100kg/ha', date: '2026-03-12', labor_hours: 8,  cost: 2500000, executor: 'Joko Purnomo',  status: 'Completed' },
  { id: 2, farm: 'Blok B - Kalimantan', cycle: 'Sawit 2026', activity_type: 'Spraying',    description: 'Penyemprotan herbisida',  date: '2026-03-20', labor_hours: 6,  cost: 1800000, executor: 'Budi Santoso',  status: 'Completed' },
  { id: 3, farm: 'Blok A - Sumatra',    cycle: 'Sawit 2026', activity_type: 'Pruning',     description: 'Pemangkasan pelepah',     date: '2026-03-25', labor_hours: 10, cost: 3000000, executor: 'Rina Dewi',     status: 'In_Progress' },
  { id: 4, farm: 'Blok C - Sulawesi',   cycle: 'Kopi 2026',  activity_type: 'Inspection',  description: 'Pengecekan hama ulat',   date: '2026-03-22', labor_hours: 3,  cost: 500000,  executor: 'Siti Aminah',   status: 'Pending' },
];

const initialHarvests = [
  { id: 1, farm: 'Blok B - Kalimantan', cycle: 'Sawit 2026', opening_date: '2026-02-15', expected_end: '2026-04-15', expected_yield_kg: 5000, actual_yield_kg: null, status: 'Open',     days_remaining: 21 },
  { id: 2, farm: 'Blok A - Sumatra',    cycle: 'Sawit 2025', opening_date: '2025-10-01', expected_end: '2025-12-01', expected_yield_kg: 8200, actual_yield_kg: 7950, status: 'Completed', days_remaining: 0 },
];

// ─── Status badge helper ─────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const map = {
    Open: 'bg-green-100 text-green-800',
    Closed: 'bg-gray-100 text-gray-600',
    Completed: 'bg-blue-100 text-blue-700',
    In_Progress: 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-orange-100 text-orange-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

// ─── Shared Table Wrapper ─────────────────────────────────────────────────────

const EmptyRow = ({ cols, label }) => (
  <tr>
    <td colSpan={cols} className="px-4 py-8 text-center text-gray-400 italic text-sm">
      {label}
    </td>
  </tr>
);

// ─── Modal wrapper ─────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className={`w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${props.className || ''}`} />
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500">
    {children}
  </select>
);

const SaveBtn = ({ saving, label = 'Simpan', color = 'green' }) => (
  <button type="submit" disabled={saving}
    className={`px-4 py-2 bg-${color}-600 text-white rounded-lg font-medium hover:bg-${color}-700 text-sm shadow-sm disabled:opacity-50`}>
    {saving ? 'Menyimpan...' : label}
  </button>
);

// ─── 1. LAND PREP SECTION ─────────────────────────────────────────────────────

const closingInput = (rec, val, setVal) => (
  <div className="space-y-2">
    <p className="text-sm text-gray-600">Masukkan tanggal penutupan lahan <strong>{rec.farm}</strong>:</p>
    <Input type="date" value={val} onChange={e => setVal(e.target.value)} required />
  </div>
);

const LandPrepSection = ({ showToast }) => {
  const [records, setRecords] = useState(initialLandRecords);
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'close'
  const [editTarget, setEditTarget] = useState(null);
  const [closingDate, setClosingDate] = useState('');
  const [form, setForm] = useState({ farm_id: '', cycle: '', opening_date: '', clearing_cost: '', notes: '' });

  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm({ farm_id: '', cycle: '', opening_date: new Date().toISOString().split('T')[0], clearing_cost: '', notes: '' }); setModal('add'); };
  const openEdit = (r) => { setEditTarget(r); setForm({ farm_id: r.farm_id, cycle: r.cycle, opening_date: r.opening_date, clearing_cost: r.clearing_cost, notes: r.notes || '' }); setModal('edit'); };
  const openClose = (r) => { setEditTarget(r); setClosingDate(new Date().toISOString().split('T')[0]); setModal('close'); };

  const handleAdd = (e) => {
    e.preventDefault();
    const farm = FARMS.find(f => f.id === form.farm_id);
    setRecords(p => [...p, { id: Date.now(), farm: farm?.name || form.farm_id, ...form, clearing_cost: +form.clearing_cost, closing_date: null, status: 'Open' }]);
    showToast('Lahan baru berhasil dibuka!');
    setModal(null);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const farm = FARMS.find(f => f.id === form.farm_id);
    setRecords(p => p.map(r => r.id === editTarget.id ? { ...r, ...form, farm: farm?.name || r.farm, clearing_cost: +form.clearing_cost } : r));
    showToast('Data lahan diperbarui!');
    setModal(null);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setRecords(p => p.map(r => r.id === editTarget.id ? { ...r, closing_date: closingDate, status: 'Closed' } : r));
    showToast('Lahan berhasil ditutup!');
    setModal(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus record lahan "${name}"?`)) {
      setRecords(p => p.filter(r => r.id !== id));
      showToast('Record lahan dihapus.');
    }
  };

  const LandForm = ({ onSubmit, label }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Farm / Blok" required>
          <Select name="farm_id" value={form.farm_id} onChange={fc} required>
            <option value="">-- Pilih Farm --</option>
            {FARMS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Siklus Tanam" required>
          <Input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Tgl Buka" required>
          <Input type="date" name="opening_date" value={form.opening_date} onChange={fc} required />
        </FormField>
        <FormField label="Biaya Pembersihan (Rp)">
          <Input type="number" name="clearing_cost" value={form.clearing_cost} onChange={fc} min="0" placeholder="0" />
        </FormField>
      </div>
      <FormField label="Catatan">
        <textarea name="notes" value={form.notes} onChange={fc} rows={2}
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Catatan tambahan..." />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
        <SaveBtn label={label} />
      </div>
    </form>
  );

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
            <tr>
              <th className="px-4 py-3">Farm / Blok</th>
              <th className="px-4 py-3">Siklus</th>
              <th className="px-4 py-3">Tgl Buka</th>
              <th className="px-4 py-3">Tgl Tutup</th>
              <th className="px-4 py-3">Biaya (Rp)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.length === 0 && <EmptyRow cols={7} label="Belum ada data lahan." />}
            {records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.farm}</td>
                <td className="px-4 py-3 text-gray-500">{r.cycle}</td>
                <td className="px-4 py-3">{new Date(r.opening_date).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3">{r.closing_date ? new Date(r.closing_date).toLocaleDateString('id-ID') : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">{r.clearing_cost ? `Rp ${Number(r.clearing_cost).toLocaleString('id-ID')}` : '—'}</td>
                <td className="px-4 py-3"><Badge status={r.status} /></td>
                <td className="px-4 py-3 flex items-center gap-2 flex-wrap">
                  <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                  {r.status === 'Open' && (
                    <button onClick={() => openClose(r)} className="text-xs text-orange-600 hover:text-orange-800 font-semibold border border-orange-300 px-2 py-0.5 rounded">Tutup</button>
                  )}
                  <button onClick={() => handleDelete(r.id, r.farm)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'add'   && <Modal title="Buka Lahan Baru" onClose={() => setModal(null)}><LandForm onSubmit={handleAdd} label="Buka Lahan" /></Modal>}
      {modal === 'edit'  && <Modal title="Edit Data Lahan" onClose={() => setModal(null)}><LandForm onSubmit={handleEdit} label="Simpan Perubahan" /></Modal>}
      {modal === 'close' && (
        <Modal title="Tutup Lahan" onClose={() => setModal(null)}>
          <form onSubmit={handleClose} className="space-y-4">
            {closingInput(editTarget, closingDate, setClosingDate)}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-sm">Konfirmasi Tutup</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── 2. PLANTING SECTION ──────────────────────────────────────────────────────

const PLANTING_STATUSES = ['Planned', 'In_Progress', 'Completed', 'Cancelled'];

const PlantingSection = ({ showToast }) => {
  const [records, setRecords] = useState(initialPlantings);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    farm_id: '', cycle: '', crop_type: '', variety: '',
    planting_date: '', area_ha: '', seedling_count: '', executor: '', status: 'Planned', notes: ''
  });

  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditTarget(null);
    setForm({ farm_id: '', cycle: '', crop_type: '', variety: '', planting_date: new Date().toISOString().split('T')[0], area_ha: '', seedling_count: '', executor: '', status: 'Planned', notes: '' });
    setModal('form');
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ ...r, farm_id: r.farm_id || FARMS.find(f => f.name === r.farm)?.id || '' });
    setModal('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const farm = FARMS.find(f => f.id === form.farm_id);
    const entry = { ...form, farm: farm?.name || form.farm || editTarget?.farm, area_ha: +form.area_ha, seedling_count: +form.seedling_count };
    if (editTarget) {
      setRecords(p => p.map(r => r.id === editTarget.id ? { ...r, ...entry } : r));
      showToast('Data penanaman diperbarui!');
    } else {
      setRecords(p => [...p, { id: Date.now(), ...entry }]);
      showToast('Aktivitas penanaman baru ditambahkan!');
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus data penanaman ini?')) {
      setRecords(p => p.filter(r => r.id !== id));
      showToast('Data penanaman dihapus.');
    }
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
            <tr>
              <th className="px-4 py-3">Farm</th>
              <th className="px-4 py-3">Tanaman</th>
              <th className="px-4 py-3">Varietas</th>
              <th className="px-4 py-3">Tgl Tanam</th>
              <th className="px-4 py-3">Luas (Ha)</th>
              <th className="px-4 py-3">Bibit</th>
              <th className="px-4 py-3">Pelaksana</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.length === 0 && <EmptyRow cols={9} label="Belum ada data penanaman." />}
            {records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.farm}</td>
                <td className="px-4 py-3 text-gray-600">{r.crop_type}</td>
                <td className="px-4 py-3 text-gray-500 italic text-xs">{r.variety || '—'}</td>
                <td className="px-4 py-3">{new Date(r.planting_date).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3">{r.area_ha} ha</td>
                <td className="px-4 py-3">{r.seedling_count?.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-gray-500">{r.executor}</td>
                <td className="px-4 py-3"><Badge status={r.status} /></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'form' && (
        <Modal title={editTarget ? 'Edit Data Penanaman' : 'Tambah Penanaman Baru'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm / Blok" required>
                <Select name="farm_id" value={form.farm_id} onChange={fc} required>
                  <option value="">-- Pilih Farm --</option>
                  {FARMS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Siklus Tanam" required>
                <Input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Jenis Tanaman" required>
                <Select name="crop_type" value={form.crop_type} onChange={fc} required>
                  <option value="">-- Pilih --</option>
                  <option value="Kelapa Sawit">Kelapa Sawit</option>
                  <option value="Kopi">Kopi</option>
                  <option value="Padi">Padi</option>
                  <option value="Jagung">Jagung</option>
                </Select>
              </FormField>
              <FormField label="Varietas">
                <Input name="variety" value={form.variety} onChange={fc} placeholder="DxP, Arabika, dll" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tanggal Tanam" required>
                <Input type="date" name="planting_date" value={form.planting_date} onChange={fc} required />
              </FormField>
              <FormField label="Luas Area (Ha)" required>
                <Input type="number" name="area_ha" value={form.area_ha} onChange={fc} required step="0.1" min="0" placeholder="5.0" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Jumlah Bibit">
                <Input type="number" name="seedling_count" value={form.seedling_count} onChange={fc} min="0" placeholder="0" />
              </FormField>
              <FormField label="Pelaksana">
                <Input name="executor" value={form.executor} onChange={fc} placeholder="Nama petani/UM" />
              </FormField>
            </div>
            <FormField label="Status">
              <Select name="status" value={form.status} onChange={fc}>
                {PLANTING_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </Select>
            </FormField>
            <FormField label="Catatan">
              <textarea name="notes" value={form.notes} onChange={fc} rows={2}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Catatan tambahan..." />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <SaveBtn label={editTarget ? 'Simpan Perubahan' : 'Tambah Penanaman'} color="emerald" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── 3. MAINTENANCE SECTION ───────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  { value: 'Fertilizing',  label: 'Pemupukan' },
  { value: 'Spraying',     label: 'Penyemprotan' },
  { value: 'Pruning',      label: 'Pemangkasan' },
  { value: 'Inspection',   label: 'Inspeksi' },
  { value: 'Land_Clearing',label: 'Pembersihan Lahan' },
  { value: 'Other',        label: 'Lainnya' },
];

const MaintenanceSection = ({ showToast }) => {
  const [records, setRecords] = useState(initialMaintenances);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    farm_id: '', cycle: '', activity_type: 'Fertilizing',
    description: '', date: '', labor_hours: '', cost: '', executor: '', status: 'Pending'
  });

  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditTarget(null);
    setForm({ farm_id: '', cycle: '', activity_type: 'Fertilizing', description: '', date: new Date().toISOString().split('T')[0], labor_hours: '', cost: '', executor: '', status: 'Pending' });
    setModal('form');
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ ...r, farm_id: r.farm_id || FARMS.find(f => f.name === r.farm)?.id || '' });
    setModal('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const farm = FARMS.find(f => f.id === form.farm_id);
    const entry = { ...form, farm: farm?.name || editTarget?.farm || form.farm, labor_hours: +form.labor_hours, cost: +form.cost };
    if (editTarget) {
      setRecords(p => p.map(r => r.id === editTarget.id ? { ...r, ...entry } : r));
      showToast('Aktivitas perawatan diperbarui!');
    } else {
      setRecords(p => [...p, { id: Date.now(), ...entry }]);
      showToast('Aktivitas perawatan ditambahkan!');
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus aktivitas perawatan ini?')) {
      setRecords(p => p.filter(r => r.id !== id));
      showToast('Aktivitas dihapus.');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setRecords(p => p.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`Status diubah menjadi ${newStatus.replace(/_/g, ' ')}`);
  };

  const filtered = filter ? records.filter(r => r.activity_type === filter) : records;
  const totalCost = records.reduce((s, r) => s + (r.cost || 0), 0);
  const totalHours = records.reduce((s, r) => s + (r.labor_hours || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Log Perawatan</h3>
          <p className="text-xs text-gray-400 mt-0.5">Pupuk, semprot, pangkas, dan inspeksi per blok</p>
        </div>
        <button onClick={openAdd} className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 shadow-sm font-medium">+ Tambah Aktivitas</button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
          <p className="text-xs text-yellow-600 font-semibold uppercase">Total Aktivitas</p>
          <p className="text-xl font-black text-yellow-800">{records.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total Jam Kerja</p>
          <p className="text-xl font-black text-blue-800">{totalHours} jam</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
          <p className="text-xs text-red-600 font-semibold uppercase">Total Biaya</p>
          <p className="text-xl font-black text-red-800">Rp {totalCost.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${!filter ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Semua
        </button>
        {ACTIVITY_TYPES.map(a => (
          <button key={a.value} onClick={() => setFilter(filter === a.value ? '' : a.value)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === a.value ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {a.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Farm</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Deskripsi</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Jam</th>
              <th className="px-4 py-3">Biaya</th>
              <th className="px-4 py-3">Pelaksana</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 && <EmptyRow cols={9} label="Tidak ada aktivitas ditemukan." />}
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.farm}</td>
                <td className="px-4 py-3">
                  <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded">
                    {ACTIVITY_TYPES.find(a => a.value === r.activity_type)?.label || r.activity_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{r.description}</td>
                <td className="px-4 py-3">{new Date(r.date).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3">{r.labor_hours}j</td>
                <td className="px-4 py-3">Rp {Number(r.cost).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-gray-500">{r.executor}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={e => handleStatusChange(r.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'form' && (
        <Modal title={editTarget ? 'Edit Aktivitas Perawatan' : 'Tambah Aktivitas Perawatan'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm / Blok" required>
                <Select name="farm_id" value={form.farm_id} onChange={fc} required>
                  <option value="">-- Pilih Farm --</option>
                  {FARMS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Siklus Tanam">
                <Input name="cycle" value={form.cycle} onChange={fc} placeholder="Sawit 2026" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Jenis Aktivitas" required>
                <Select name="activity_type" value={form.activity_type} onChange={fc} required>
                  {ACTIVITY_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </Select>
              </FormField>
              <FormField label="Tanggal" required>
                <Input type="date" name="date" value={form.date} onChange={fc} required />
              </FormField>
            </div>
            <FormField label="Deskripsi">
              <Input name="description" value={form.description} onChange={fc} placeholder="Detail kegiatan..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Jam Kerja">
                <Input type="number" name="labor_hours" value={form.labor_hours} onChange={fc} min="0" step="0.5" placeholder="0" />
              </FormField>
              <FormField label="Biaya (Rp)">
                <Input type="number" name="cost" value={form.cost} onChange={fc} min="0" placeholder="0" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Pelaksana">
                <Input name="executor" value={form.executor} onChange={fc} placeholder="Nama petani/UM" />
              </FormField>
              <FormField label="Status">
                <Select name="status" value={form.status} onChange={fc}>
                  <option value="Pending">Pending</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <SaveBtn label={editTarget ? 'Simpan Perubahan' : 'Tambah Aktivitas'} color="yellow" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── 4. HARVESTING SECTION ─────────────────────────────────────────────────────

const HarvestingSection = ({ showToast }) => {
  const [records, setRecords] = useState(initialHarvests);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [yieldInput, setYieldInput] = useState('');
  const [form, setForm] = useState({
    farm_id: '', cycle: '', opening_date: '',
    expected_end: '', expected_yield_kg: '', notes: ''
  });

  const fc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditTarget(null);
    setForm({ farm_id: '', cycle: '', opening_date: new Date().toISOString().split('T')[0], expected_end: '', expected_yield_kg: '', notes: '' });
    setModal('form');
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ ...r, farm_id: r.farm_id || FARMS.find(f => f.name === r.farm)?.id || '' });
    setModal('form');
  };

  const openClose = (r) => { setEditTarget(r); setYieldInput(''); setModal('close'); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const farm = FARMS.find(f => f.id === form.farm_id);
    const now = new Date();
    const end = new Date(form.expected_end);
    const days_remaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    const entry = { ...form, farm: farm?.name || editTarget?.farm, expected_yield_kg: +form.expected_yield_kg, days_remaining, actual_yield_kg: null, status: 'Open' };
    if (editTarget) {
      setRecords(p => p.map(r => r.id === editTarget.id ? { ...r, ...entry, status: r.status, actual_yield_kg: r.actual_yield_kg } : r));
      showToast('Data panen diperbarui!');
    } else {
      setRecords(p => [...p, { id: Date.now(), ...entry }]);
      showToast('Masa panen baru dibuka!');
    }
    setModal(null);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setRecords(p => p.map(r => r.id === editTarget.id
      ? { ...r, status: 'Completed', actual_yield_kg: +yieldInput, days_remaining: 0 }
      : r
    ));
    showToast(`Masa panen ditutup. Hasil: ${Number(yieldInput).toLocaleString('id-ID')} kg`);
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus record panen ini?')) {
      setRecords(p => p.filter(r => r.id !== id));
      showToast('Record panen dihapus.');
    }
  };

  const totalHarvested = records.filter(r => r.actual_yield_kg).reduce((s, r) => s + r.actual_yield_kg, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Manajemen Panen</h3>
          <p className="text-xs text-gray-400 mt-0.5">Buka/tutup periode panen & catat hasil aktual</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 shadow-sm font-medium">+ Buka Masa Panen</button>
      </div>

      {/* Harvest summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
          <p className="text-xs text-orange-600 font-semibold uppercase">Total Perioda</p>
          <p className="text-xl font-black text-orange-800">{records.length}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 font-semibold uppercase">Sedang Buka</p>
          <p className="text-xl font-black text-green-800">{records.filter(r => r.status === 'Open').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total Aktual (Kg)</p>
          <p className="text-xl font-black text-blue-800">{totalHarvested.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Farm</th>
              <th className="px-4 py-3">Siklus</th>
              <th className="px-4 py-3">Tgl Buka</th>
              <th className="px-4 py-3">Est. Akhir</th>
              <th className="px-4 py-3">Target (Kg)</th>
              <th className="px-4 py-3">Aktual (Kg)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sisa Hari</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.length === 0 && <EmptyRow cols={9} label="Belum ada data panen." />}
            {records.map(r => {
              const isOverdue = r.status === 'Open' && r.days_remaining === 0;
              const isUrgent = r.status === 'Open' && r.days_remaining > 0 && r.days_remaining <= 7;
              return (
                <tr key={r.id} className={`hover:bg-gray-50 transition ${isOverdue ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.farm}</td>
                  <td className="px-4 py-3 text-gray-500">{r.cycle}</td>
                  <td className="px-4 py-3">{new Date(r.opening_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">{new Date(r.expected_end).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">{r.expected_yield_kg?.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{r.actual_yield_kg != null ? r.actual_yield_kg.toLocaleString('id-ID') : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3">
                    {r.status === 'Open' ? (
                      <span className={`font-bold text-xs ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-600'}`}>
                        {isOverdue ? '⚠️ Terlambat' : `${r.days_remaining} hari`}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 flex gap-2 flex-wrap items-center">
                    <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                    {r.status === 'Open' && (
                      <button onClick={() => openClose(r)} className="text-xs text-orange-600 hover:text-orange-800 font-semibold border border-orange-300 px-2 py-0.5 rounded">Tutup</button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Farm / Blok" required>
                <Select name="farm_id" value={form.farm_id} onChange={fc} required>
                  <option value="">-- Pilih Farm --</option>
                  {FARMS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Siklus Tanam" required>
                <Input name="cycle" value={form.cycle} onChange={fc} required placeholder="Sawit 2026" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tgl Mulai Panen" required>
                <Input type="date" name="opening_date" value={form.opening_date} onChange={fc} required />
              </FormField>
              <FormField label="Estimasi Selesai" required>
                <Input type="date" name="expected_end" value={form.expected_end} onChange={fc} required />
              </FormField>
            </div>
            <FormField label="Target Hasil (Kg)">
              <Input type="number" name="expected_yield_kg" value={form.expected_yield_kg} onChange={fc} min="0" placeholder="5000" />
            </FormField>
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
              <p className="text-sm text-orange-800 font-semibold">{editTarget?.farm} — {editTarget?.cycle}</p>
              <p className="text-xs text-orange-600 mt-0.5">Target: {editTarget?.expected_yield_kg?.toLocaleString('id-ID')} kg</p>
            </div>
            <FormField label="Hasil Panen Aktual (Kg)" required>
              <Input type="number" value={yieldInput} onChange={e => setYieldInput(e.target.value)} required min="0" placeholder="0" />
            </FormField>
            {yieldInput && editTarget?.expected_yield_kg && (
              <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${+yieldInput >= editTarget.expected_yield_kg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {+yieldInput >= editTarget.expected_yield_kg
                  ? `✅ Melebihi target sebesar ${(+yieldInput - editTarget.expected_yield_kg).toLocaleString('id-ID')} kg`
                  : `⚠️ Di bawah target sebesar ${(editTarget.expected_yield_kg - +yieldInput).toLocaleString('id-ID')} kg`}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Batal</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-sm">Konfirmasi Tutup Panen</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── Main LifecycleTabs ────────────────────────────────────────────────────────

const STAGES = [
  { id: 'Land_Prep',   name: 'Persiapan Lahan', icon: '🌿', color: 'blue'   },
  { id: 'Planting',    name: 'Penanaman',        icon: '🌱', color: 'emerald'},
  { id: 'Maintenance', name: 'Perawatan',         icon: '🔧', color: 'yellow' },
  { id: 'Harvesting',  name: 'Panen',            icon: '🌾', color: 'orange' },
];

const LifecycleTabs = () => {
  const [stage, setStage] = useState('Land_Prep');
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          ✓ {notification}
        </div>
      )}

      {/* Sidebar tabs */}
      <div className="w-full md:w-1/5 flex-shrink-0">
        <div className="bg-gray-50 rounded-xl p-2 flex flex-col gap-1">
          {STAGES.map(s => (
            <button
              key={s.id}
              onClick={() => setStage(s.id)}
              className={`flex items-center gap-3 text-left px-4 py-3.5 rounded-lg text-sm font-medium transition ${
                stage === s.id
                  ? 'bg-white shadow text-gray-800 border border-gray-200'
                  : 'text-gray-500 hover:bg-white hover:text-gray-700'
              }`}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stage content */}
      <div className="flex-1 min-w-0">
        {stage === 'Land_Prep'   && <LandPrepSection   showToast={showToast} />}
        {stage === 'Planting'    && <PlantingSection    showToast={showToast} />}
        {stage === 'Maintenance' && <MaintenanceSection showToast={showToast} />}
        {stage === 'Harvesting'  && <HarvestingSection  showToast={showToast} />}
      </div>
    </div>
  );
};

export default LifecycleTabs;
