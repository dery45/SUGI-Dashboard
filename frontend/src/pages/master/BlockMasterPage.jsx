import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import { Input, Select } from '../../components/common/FormField';
import { useAuth } from '../../contexts/AuthContext';
import { required, isNumber, minValue, validateForm } from '../../utils/validation';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const BlockMasterPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', farm: '', area_ha: '', soil_type: 'Alluvial', water_source: 'Irigasi', status: 'Active', notes: '' });
  const [errors, setErrors] = useState({});

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [blocksRes, farmsRes] = await Promise.all([
        fetch(`${BASE_URL}/master-data/blocks`, { headers }),
        fetch(`${BASE_URL}/master-data/farms`, { headers })
      ]);
      const blocksJson = await blocksRes.json();
      const farmsJson = await farmsRes.json();
      if (blocksJson.success) setData(blocksJson.data);
      if (farmsJson.success) setFarms(farmsJson.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validate = () => {
    const { errors: e, hasErrors } = validateForm(form, {
      name: [[required, 'Nama Block']],
      code: [[required, 'Kode Block']],
      farm: [[required, 'Farm']],
      area_ha: [[required, 'Luas Area'], [isNumber, 'Luas Area'], [minValue, 0, 'Luas Area']]
    });
    setErrors(e);
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const url = editItem ? `${BASE_URL}/master-data/blocks/${editItem._id}` : `${BASE_URL}/master-data/blocks`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) {
        if (json.errors) { setErrors(json.errors); return; }
        alert(json.message || 'Gagal menyimpan data');
        return;
      }
      setShowModal(false); setEditItem(null);
      setForm({ code: '', name: '', farm: '', area_ha: '', soil_type: 'Alluvial', water_source: 'Irigasi', status: 'Active', notes: '' });
      setErrors({});
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({ ...item, farm: item.farm?._id || item.farm || '' });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    await fetch(`${BASE_URL}/master-data/blocks/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const getFarmName = (farmId) => {
    if (!farmId) return '-';
    const id = typeof farmId === 'object' ? farmId._id : farmId;
    const f = farms.find(x => x._id === id);
    return f ? f.name : '-';
  };

  const columns = [
    { header: 'Kode', accessor: 'code' },
    { header: 'Nama', accessor: 'name' },
    { header: 'Farm', accessor: (r) => getFarmName(r.farm) },
    { header: 'Luas (Ha)', accessor: 'area_ha' },
    { header: 'Jenis Tanah', accessor: 'soil_type' },
    { header: 'Sumber Air', accessor: 'water_source' },
    { header: 'Status', accessor: 'status' }
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Master Data Block</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola data blok / petak</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="p-2.5 rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-all"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={() => { setEditItem(null); setForm({ code: '', name: '', farm: '', area_ha: '', soil_type: 'Alluvial', water_source: 'Irigasi', status: 'Active', notes: '' }); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Tambah Block</button>
          </div>
        </div>
      </div>

      <Card title="Daftar Block">
        <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} itemsPerPage={10} />
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-surface border border-border/40 rounded-[2rem] shadow-2xl p-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">{editItem ? 'Edit Block' : 'Tambah Block Baru'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Kode Block" name="code" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} error={errors.code} />
              <Input label="Nama Block" name="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Select label="Farm" name="farm" required value={form.farm} onChange={e => setForm({ ...form, farm: e.target.value })} error={errors.farm}>
                <option value="">Pilih Farm</option>
                {farms.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
              </Select>
              <Input label="Luas (Ha)" name="area_ha" type="number" required value={form.area_ha} onChange={e => setForm({ ...form, area_ha: e.target.value })} error={errors.area_ha} />
              <Select label="Jenis Tanah" name="soil_type" value={form.soil_type} optional onChange={e => setForm({ ...form, soil_type: e.target.value })}>
                {['Alluvial', 'Andosol', 'Gambut', 'Grumusol', 'Laterit', 'Latosol', 'Mediteran', 'Organosol', 'Podsolik', 'Renzina', 'Regosol'].map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Input label="Sumber Air" name="water_source" value={form.water_source} optional onChange={e => setForm({ ...form, water_source: e.target.value })} />
              <Select label="Status" name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Deskripsi <span className="text-muted/50 font-normal normal-case">(Optional)</span></label>
                <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockMasterPage;
