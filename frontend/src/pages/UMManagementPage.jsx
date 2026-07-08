import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import { Select } from '../components/common/FormField';
import { required, validateForm } from '../utils/validation';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const STAGE_OPTIONS = [
  { value: 'Land_Preparation', label: 'Persiapan Lahan' },
  { value: 'Planting', label: 'Penanaman' },
  { value: 'Maintenance', label: 'Perawatan' },
  { value: 'Harvesting', label: 'Panen' }
];

const stageLabels = { Land_Preparation: 'Persiapan Lahan', Planting: 'Penanaman', Maintenance: 'Perawatan', Harvesting: 'Panen' };

const UMManagementPage = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ farmer: '', blocks: [], access_stages: [] });
  const [errors, setErrors] = useState({});
  const [filterFarm, setFilterFarm] = useState('');
  const [notification, setNotification] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [aRes, fRes, bRes, farmRes] = await Promise.all([
        fetch(`${BASE_URL}/assignments/farmer-assignments`, { headers }),
        fetch(`${BASE_URL}/farmers?role=farmer&limit=100`, { headers }),
        fetch(`${BASE_URL}/master-data/blocks`, { headers }),
        fetch(`${BASE_URL}/master-data/farms`, { headers })
      ]);
      const aJson = await aRes.json();
      const fJson = await fRes.json();
      const bJson = await bRes.json();
      const farmJson = await farmRes.json();
      if (aJson.success) setAssignments(aJson.data);
      if (fJson.success) setFarmers(fJson.data);
      if (bJson.success) setBlocks(bJson.data);
      if (farmJson.success) setFarms(farmJson.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validate = () => {
    const { errors: e, hasErrors } = validateForm(form, {
      farmer: [[required, 'Petani']]
    });
    if (!form.blocks || form.blocks.length === 0) e.blocks = 'Minimal satu block harus dipilih';
    setErrors(e);
    return !hasErrors && Object.keys(e).length === 0;
  };

  const handleCreateAssignment = async () => {
    if (!validate()) return;
    try {
      if (editItem) {
        const res = await fetch(`${BASE_URL}/assignments/farmer-assignments/${editItem._id}`, {
          method: 'PUT', headers, body: JSON.stringify({ access_stages: form.access_stages })
        });
        const json = await res.json();
        if (!json.success) {
          if (json.errors) setErrors(json.errors);
          else { showToast(json.message || 'Gagal memperbarui penugasan'); }
          return;
        }
        setShowModal(false);
        setEditItem(null);
        setForm({ farmer: '', blocks: [], access_stages: [] });
        setErrors({});
        showToast('Penugasan berhasil diperbarui!');
      } else {
        const res = await fetch(`${BASE_URL}/assignments/farmer-assignments`, {
          method: 'POST', headers, body: JSON.stringify({ farmer: form.farmer, blocks: form.blocks, access_stages: form.access_stages })
        });
        const json = await res.json();
        if (!json.success) {
          if (json.errors) setErrors(json.errors);
          else { showToast(json.message || 'Gagal menyimpan penugasan'); }
          return;
        }
        setShowModal(false);
        setForm({ farmer: '', blocks: [], access_stages: [] });
        setErrors({});
        showToast('Penugasan berhasil disimpan!');
      }
      fetchData();
    } catch (e) { showToast(e.message); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      farmer: typeof item.farmer === 'object' ? item.farmer._id : item.farmer,
      blocks: [typeof item.block === 'object' ? item.block._id : item.block],
      access_stages: item.access_stages || []
    });
    setErrors({});
    setShowModal(true);
  };

  const handleRemoveAssignment = async (id) => {
    if (!confirm('Hapus penugasan ini?')) return;
    try {
      const res = await fetch(`${BASE_URL}/assignments/farmer-assignments/${id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!json.success) { showToast(json.message); return; }
      showToast('Penugasan dihapus');
      fetchData();
    } catch (e) { showToast(e.message); }
  };

  const toggleBlock = (blockId) => {
    setForm(prev => ({
      ...prev,
      blocks: prev.blocks.includes(blockId)
        ? prev.blocks.filter(b => b !== blockId)
        : [...prev.blocks, blockId]
    }));
  };

  const toggleStage = (stage) => {
    setForm(prev => ({
      ...prev,
      access_stages: prev.access_stages.includes(stage)
        ? prev.access_stages.filter(s => s !== stage)
        : [...prev.access_stages, stage]
    }));
  };

  const getBlockFarmName = (item) => {
    if (!item.block) return '-';
    if (typeof item.block === 'object') {
      const bName = item.block.name || item.block.code || '-';
      const fName = item.farm?.name || '';
      return fName ? `${bName} (${fName})` : bName;
    }
    const b = blocks.find(x => x._id === item.block);
    if (!b) return '-';
    const farmId = typeof b.farm === 'object' ? b.farm?._id : b.farm;
    const f = farms.find(x => x._id === farmId);
    return `${b.name || b.code}${f ? ` (${f.name})` : ''}`;
  };

  const getFarmerName = (farmerRef) => {
    if (!farmerRef) return '-';
    if (typeof farmerRef === 'object') return farmerRef.name || '-';
    const f = farmers.find(x => x._id === farmerRef);
    return f ? f.name : '-';
  };

  const renderStages = (item) => {
    const stages = item.access_stages || item.access_stages_labels || [];
    if (stages.length === 0) return <span className="text-muted text-xs italic">Tidak ada</span>;
    return stages.map(s => stageLabels[s] || s).join(', ');
  };

  const filteredAssignments = filterFarm
    ? assignments.filter(a => {
        const farmId = typeof a.farm === 'object' ? a.farm?._id : a.farm;
        return farmId === filterFarm;
      })
    : assignments;

  const columns = [
    { header: 'Petani', accessor: (r) => getFarmerName(r.farmer) },
    { header: 'Block', accessor: getBlockFarmName },
    { header: 'Akses Siklus', accessor: renderStages },
    { header: 'Ditugaskan', accessor: (r) => new Date(r.createdAt || r.assigned_at).toLocaleDateString('id-ID') }
  ];

  const blocksByFarm = {};
  blocks.filter(b => b.status !== 'Inactive').forEach(b => {
    const farmId = typeof b.farm === 'object' ? b.farm?._id : b.farm;
    const f = farms.find(x => x._id === farmId);
    const key = f ? f.name : 'Unknown';
    if (!blocksByFarm[key]) blocksByFarm[key] = [];
    blocksByFarm[key].push(b);
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold">{notification}</div>}

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div><h1 className="text-2xl font-black text-foreground tracking-tight">Unit Manajemen (UM)</h1><p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Penugasan petani ke blok + akses siklus</p></div>
          </div>
          <button onClick={() => { setEditItem(null); setForm({ farmer: '', blocks: [], access_stages: [] }); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider">+ Tambah Penugasan</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="p-2"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Penugasan</p><p className="text-2xl font-black text-foreground mt-1">{assignments.length}</p></div></Card>
        <Card><div className="p-2"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Petani Ditugaskan</p><p className="text-2xl font-black text-foreground mt-1">{new Set(assignments.map(a => a.farmer?._id || a.farmer).filter(Boolean)).size}</p></div></Card>
        <Card><div className="p-2"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Blok Terisi</p><p className="text-2xl font-black text-foreground mt-1">{new Set(assignments.map(a => a.block?._id || a.block).filter(Boolean)).size}</p></div></Card>
        <Card><div className="p-2"><p className="text-[10px] font-bold text-muted uppercase tracking-wider">Petani Tersedia</p><p className="text-2xl font-black text-foreground mt-1">{farmers.length}</p></div></Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Filter Farm:</label>
        <select value={filterFarm} onChange={e => setFilterFarm(e.target.value)} className="px-3 py-2 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Semua Farm</option>
          {farms.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
        </select>
      </div>

      <Card title="Daftar Penugasan Petani">
        <DataTable columns={columns} data={filteredAssignments} onEdit={handleEdit} onDelete={handleRemoveAssignment} itemsPerPage={10} />
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-2xl bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">{editItem ? 'Edit Penugasan' : 'Penugasan Baru'}</h2>
            <div className="flex flex-col gap-5">
              {!editItem && (
                <>
                  <Select label="Petani" name="farmer" required value={form.farmer} onChange={e => setForm({ ...form, farmer: e.target.value })} error={errors.farmer}>
                    <option value="">Pilih Petani</option>
                    {farmers.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
                  </Select>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Block / Lahan <span className="text-destructive">*</span></label>
                    {Object.entries(blocksByFarm).map(([farmName, farmBlocks]) => (
                      <div key={farmName}>
                        <p className="text-[11px] font-bold text-primary mb-1.5">{farmName}</p>
                        <div className="grid grid-cols-2 gap-1.5 pl-2">
                          {farmBlocks.map(b => (
                            <label key={b._id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${form.blocks.includes(b._id) ? 'bg-primary/10 border-primary text-primary' : 'border-border/40 hover:border-primary/30'}`}>
                              <input type="checkbox" checked={form.blocks.includes(b._id)} onChange={() => toggleBlock(b._id)} className="accent-primary" />
                              {b.name || b.code} ({b.area_ha} Ha)
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    {errors.blocks && <p className="text-destructive text-xs font-semibold">{errors.blocks}</p>}
                  </div>
                </>
              )}
              {editItem && (
                <div className="p-4 bg-background/30 rounded-2xl border border-border/30">
                  <p className="text-sm font-bold text-foreground">Mengedit penugasan untuk:</p>
                  <p className="text-xs text-muted mt-1">Petani: <span className="font-semibold text-foreground">{getFarmerName(editItem.farmer)}</span></p>
                  <p className="text-xs text-muted">Block: <span className="font-semibold text-foreground">{getBlockFarmName(editItem)}</span></p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Akses Siklus Pertanian <span className="text-muted/50 font-normal normal-case">(Opsional)</span></label>
                <div className="grid grid-cols-2 gap-1.5">
                  {STAGE_OPTIONS.map(s => (
                    <label key={s.value} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${form.access_stages.includes(s.value) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'border-border/40 hover:border-emerald-500/30'}`}>
                      <input type="checkbox" checked={form.access_stages.includes(s.value)} onChange={() => toggleStage(s.value)} className="accent-emerald-500" />
                      {s.label}
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-muted italic mt-0.5">Kosongkan semua jika ingin memberi akses penuh ke semua tahapan</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
              <button onClick={handleCreateAssignment} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UMManagementPage;
