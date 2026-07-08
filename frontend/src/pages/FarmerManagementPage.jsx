import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import { Input, Select } from '../components/common/FormField';
import { required, isEmail, compose, validateForm } from '../utils/validation';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const ROLE_LABELS = { superadmin: 'Super Admin', government: 'Pemerintah', farmer_owner: 'Pemilik Petani', farmer: 'Petani' };
const ROLE_COLORS = { superadmin: 'bg-red-100 text-red-700', government: 'bg-purple-100 text-purple-700', farmer_owner: 'bg-blue-100 text-blue-700', farmer: 'bg-green-100 text-green-700' };

const FarmerManagementPage = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', role: 'farmer', assigned_farms: [] });
  const [errors, setErrors] = useState({});

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);
      const [uRes, fRes] = await Promise.all([
        fetch(`${BASE_URL}/farmers?${params}`, { headers }),
        fetch(`${BASE_URL}/master-data/farms/all`, { headers })
      ]);
      const uJson = await uRes.json();
      const fJson = await fRes.json();
      if (uJson.success) setUsers(uJson.data);
      if (fJson.success) setFarms(fJson.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, roleFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const validate = () => {
    const rules = {
      name: [[required, 'Nama']],
      email: [[compose(required, isEmail), 'Email']]
    };
    if (!editItem) rules.password = [[required, 'Password']];
    const { errors: e, hasErrors } = validateForm(form, rules);
    if (form.role === 'farmer_owner' && (!form.assigned_farms || form.assigned_farms.length === 0)) {
      e.assigned_farms = 'Minimal satu farm harus ditugaskan';
    }
    setErrors(e);
    return !hasErrors && !e.assigned_farms;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const url = editItem ? `${BASE_URL}/farmers/${editItem._id}` : `${BASE_URL}/farmers`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const body = { ...form };
      if (editItem && !body.password) delete body.password;
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) {
        if (json.errors) setErrors(json.errors);
        else alert(json.message);
        return;
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ name: '', email: '', password: '', phone: '', address: '', role: 'farmer', assigned_farms: [] });
      setErrors({});
      showToast(editItem ? `Pengguna "${form.name}" berhasil diperbarui!` : `Pengguna "${form.name}" berhasil ditambahkan!`);
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name || '',
      email: item.email || '',
      password: '',
      phone: item.phone || '',
      address: item.address || '',
      role: item.role || 'farmer',
      assigned_farms: (item.assigned_farms || []).map(f => typeof f === 'object' ? f._id : f)
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Nonaktifkan pengguna "${name}"?`)) return;
    const res = await fetch(`${BASE_URL}/farmers/${id}`, { method: 'DELETE', headers });
    const json = await res.json();
    if (json.success) { showToast(`"${name}" berhasil dinonaktifkan.`); fetchData(); }
  };

  const roleOptions = user?.role === 'farmer_owner'
    ? [{ value: 'farmer', label: 'Petani' }]
    : [{ value: 'farmer', label: 'Petani' }, { value: 'farmer_owner', label: 'Pemilik Petani' }, { value: 'government', label: 'Pemerintah' }];

  const toggleFarm = (farmId) => {
    setForm(prev => ({
      ...prev,
      assigned_farms: prev.assigned_farms.includes(farmId)
        ? prev.assigned_farms.filter(f => f !== farmId)
        : [...prev.assigned_farms, farmId]
    }));
  };

  const columns = [
    { header: 'Nama', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Telepon', accessor: 'phone' },
    { header: 'Peran', accessor: (r) => <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[r.role] || 'bg-gray-100 text-gray-600'}`}>{ROLE_LABELS[r.role] || r.role}</span> },
    { header: 'Alamat', accessor: 'address' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold">{notification}</div>
      )}

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Petani & Pengguna</h1>
              <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola seluruh akun pengguna</p>
            </div>
          </div>
          <button onClick={() => { setEditItem(null); setForm({ name: '', email: '', password: '', phone: '', address: '', role: 'farmer', assigned_farms: [] }); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider">+ Tambah Pengguna</button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text" placeholder="Cari nama atau email..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Semua Peran</option>
          {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Card title="Daftar Pengguna">
        <DataTable columns={columns} data={users} onEdit={handleEdit} onDelete={handleDelete} itemsPerPage={10} />
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-lg bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">{editItem ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
            <div className="flex flex-col gap-4">
              <Input label="Nama" name="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Input label="Email" name="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email} />
              <Input label={editItem ? 'Password (kosongkan jika tidak diubah)' : 'Password'} name="password" type="password" required={!editItem} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} error={errors.password} />
              <Input label="Telepon" name="phone" optional value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Select label="Peran" name="role" required value={form.role} onChange={e => setForm({ ...form, role: e.target.value, assigned_farms: [] })} error={errors.role}>
                {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>

              {form.role === 'farmer_owner' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Farm yang Ditugaskan <span className="text-destructive ml-1">*Required</span>
                  </label>
                  {errors.assigned_farms && <p className="text-[11px] font-semibold text-destructive">{errors.assigned_farms}</p>}
                  {farms.length === 0 ? (
                    <p className="text-sm text-muted/50 italic">Belum ada farm tersedia.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-border/30 rounded-xl">
                      {farms.map(farm => (
                        <label key={farm._id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm ${
                          form.assigned_farms.includes(farm._id)
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-background/30 border border-border/30 hover:border-primary/30'
                        }`}>
                          <input
                            type="checkbox"
                            checked={form.assigned_farms.includes(farm._id)}
                            onChange={() => toggleFarm(farm._id)}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="font-medium text-foreground">{farm.name}</span>
                          <span className="text-muted text-[10px] ml-auto">{farm.code}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {form.assigned_farms.length > 0 && (
                    <p className="text-[10px] text-muted">{form.assigned_farms.length} farm dipilih</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">{editItem ? 'Perbarui' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerManagementPage;
