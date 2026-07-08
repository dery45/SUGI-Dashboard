import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import { Input, Select } from '../../components/common/FormField';
import { useAuth } from '../../contexts/AuthContext';
import { required, isNumber, minValue, validateForm } from '../../utils/validation';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const FarmMasterPage = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', province: '', city: '', district: '', village: '', total_area_ha: '', status: 'Active', land_owner: '', responsible_person: '', contact: '', description: '' });
  const [errors, setErrors] = useState({});

  const isFarmerOwner = user?.role === 'farmer_owner';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/master-data/farms`, { headers });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validate = () => {
    const { errors: e, hasErrors } = validateForm(form, {
      name: [[required, 'Nama Farm']],
      code: [[required, 'Kode Farm']],
      total_area_ha: [[isNumber, 'Luas Area'], [minValue, 0, 'Luas Area']]
    });
    setErrors(e);
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const url = editItem ? `${BASE_URL}/master-data/farms/${editItem._id}` : `${BASE_URL}/master-data/farms`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) {
        if (json.errors) setErrors(json.errors);
        else alert(json.message);
        return;
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ name: '', code: '', province: '', city: '', district: '', village: '', total_area_ha: '', status: 'Active', land_owner: '', responsible_person: '', contact: '', description: '' });
      setErrors({});
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    await fetch(`${BASE_URL}/master-data/farms/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const columns = [
    { header: 'Kode', accessor: 'code' },
    { header: 'Nama', accessor: 'name' },
    { header: 'Provinsi', accessor: 'province' },
    { header: 'Luas (Ha)', accessor: 'total_area_ha' },
    { header: 'Status', accessor: 'status' },
    { header: 'Pemilik', accessor: 'land_owner' },
    { header: 'Kontak', accessor: 'contact' }
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Master Data Farm</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola data farm</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="p-2.5 rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-all"><RefreshCw className="w-4 h-4" /></button>
            {!isFarmerOwner && (
              <button onClick={() => { setEditItem(null); setForm({ name: '', code: '', province: '', city: '', district: '', village: '', total_area_ha: '', status: 'Active', land_owner: '', responsible_person: '', contact: '', description: '' }); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Tambah Farm</button>
            )}
          </div>
        </div>
        {isFarmerOwner && (
          <p className="text-[11px] text-muted/70 mt-2 italic">Anda hanya dapat melihat dan mengedit farm yang ditugaskan.</p>
        )}
      </div>

      <Card title="Daftar Farm">
        <DataTable columns={columns} data={data} onEdit={isFarmerOwner ? handleEdit : handleEdit} onDelete={isFarmerOwner ? undefined : handleDelete} itemsPerPage={10} />
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-surface border border-border/40 rounded-[2rem] shadow-2xl p-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">{editItem ? 'Edit Farm' : 'Tambah Farm Baru'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Kode Farm" name="code" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} error={errors.code} />
              <Input label="Nama Farm" name="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Input label="Provinsi" name="province" value={form.province} optional onChange={e => setForm({ ...form, province: e.target.value })} />
              <Input label="Kota/Kab" name="city" value={form.city} optional onChange={e => setForm({ ...form, city: e.target.value })} />
              <Input label="Kecamatan" name="district" value={form.district} optional onChange={e => setForm({ ...form, district: e.target.value })} />
              <Input label="Desa" name="village" value={form.village} optional onChange={e => setForm({ ...form, village: e.target.value })} />
              <Input label="Luas (Ha)" name="total_area_ha" type="number" required value={form.total_area_ha} onChange={e => setForm({ ...form, total_area_ha: e.target.value })} error={errors.total_area_ha} />
              <Input label="Pemilik Lahan" name="land_owner" value={form.land_owner} optional onChange={e => setForm({ ...form, land_owner: e.target.value })} />
              <Input label="Penanggung Jawab" name="responsible_person" value={form.responsible_person} optional onChange={e => setForm({ ...form, responsible_person: e.target.value })} />
              <Input label="Kontak" name="contact" value={form.contact} optional onChange={e => setForm({ ...form, contact: e.target.value })} />
              <Select label="Status" name="status" required value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Deskripsi <span className="text-muted/50 font-normal normal-case">(Optional)</span></label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} />
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

export default FarmMasterPage;
