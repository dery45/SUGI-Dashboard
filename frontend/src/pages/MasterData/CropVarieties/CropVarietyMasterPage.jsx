import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Trash2, Pencil } from 'lucide-react';
import Card from '@/component/common/Card';
import DataTable from '@/component/common/DataTable';
import { Input, Select } from '@/component/common/FormField';
import { useAuth } from '@/contexts/AuthContext';
import { required, validateForm } from '@/utils/validation';
import { API_BASE_URL as BASE_URL } from '@/services/authService';
import ViewDetailModal from '@/component/common/ViewDetailModal';
import { useToast } from '@/contexts/ToastContext';

const CropVarietyMasterPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', crop_type: '', unit: '', description: '', status: 'Active' });
  const [grades, setGrades] = useState([]);
  const [gradeForm, setGradeForm] = useState({ grade_name: '', estimated_price_per_unit: '' });
  const [gradeEditIdx, setGradeEditIdx] = useState(null);
  const [errors, setErrors] = useState({});
  const [viewModal, setViewModal] = useState(null);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const { showToast } = useToast();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [rV, rC, rU] = await Promise.all([
        fetch(`${BASE_URL}/master-data/crop-varieties`, { headers }).then(r => r.json()),
        fetch(`${BASE_URL}/master-data/crop-types/all`, { headers }).then(r => r.json()),
        fetch(`${BASE_URL}/master-data/units/all`, { headers }).then(r => r.json()),
      ]);
      if (rV.success) setData(rV.data);
      if (rC.success) setCropTypes(rC.data);
      if (rU.success) setUnits(rU.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validate = () => {
    const { errors: e, hasErrors } = validateForm(form, { name: [[required, 'Nama Varietas']], crop_type: [[required, 'Jenis Tanaman']], unit: [[required, 'Satuan']] });
    setErrors(e); return !hasErrors;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = { ...form, grades };
    const url = editItem ? `${BASE_URL}/master-data/crop-varieties/${editItem._id}` : `${BASE_URL}/master-data/crop-varieties`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!json.success) { if (json.errors) { setErrors(json.errors); return; } showToast(json.message || 'Gagal menyimpan data', 'error'); return; }
      setShowModal(false); setEditItem(null); setForm({ name: '', crop_type: '', unit: '', description: '', status: 'Active' }); setGrades([]); setErrors({}); fetchAll(); showToast('Data varietas berhasil disimpan!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, crop_type: item.crop_type?._id || item.crop_type, unit: item.unit?._id || item.unit, description: item.description || '', status: item.status });
    setGrades(item.grades || []);
    setErrors({}); setShowModal(true);
  };
  const handleDelete = async (id) => { if (!confirm('Hapus data ini?')) return; await fetch(`${BASE_URL}/master-data/crop-varieties/${id}`, { method: 'DELETE', headers }); fetchAll(); showToast('Data varietas berhasil dihapus!', 'success'); };

  const addGrade = () => {
    if (!gradeForm.grade_name || !gradeForm.estimated_price_per_unit) { showToast('Isi nama grade dan harga', 'error'); return; }
    if (gradeEditIdx !== null) {
      const copy = [...grades]; copy[gradeEditIdx] = { grade_name: gradeForm.grade_name, estimated_price_per_unit: Number(gradeForm.estimated_price_per_unit) }; setGrades(copy); setGradeEditIdx(null);
    } else {
      setGrades([...grades, { grade_name: gradeForm.grade_name, estimated_price_per_unit: Number(gradeForm.estimated_price_per_unit) }]);
    }
    setGradeForm({ grade_name: '', estimated_price_per_unit: '' });
  };
  const editGrade = (idx) => { setGradeForm({ grade_name: grades[idx].grade_name, estimated_price_per_unit: grades[idx].estimated_price_per_unit }); setGradeEditIdx(idx); };
  const deleteGrade = (idx) => { setGrades(grades.filter((_, i) => i !== idx)); };

  const columns = [
    { header: 'Nama Varietas', accessor: 'name' },
    { header: 'Jenis Tanaman', accessor: r => r.crop_type?.name || '-' },
    { header: 'Satuan', accessor: r => r.unit ? `${r.unit.name} (${r.unit.symbol})` : '-' },
    { header: 'Grade', accessor: r => (r.grades || []).length },
    { header: 'Status', accessor: 'status' },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" /><div><h1 className="text-2xl font-black text-foreground tracking-tight">Master Data Varietas</h1><p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola varietas per jenis tanaman dengan grade</p></div></div>
          <div className="flex gap-3"><button onClick={fetchAll} className="p-2.5 rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-all"><RefreshCw className="w-4 h-4" /></button><button onClick={() => { setEditItem(null); setForm({ name: '', crop_type: '', unit: '', description: '', status: 'Active' }); setGrades([]); setErrors({}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Tambah Varietas</button></div>
        </div>
      </div>
      <Card title="Daftar Varietas"><DataTable columns={columns} data={data} onView={setViewModal} onEdit={handleEdit} onDelete={handleDelete} itemsPerPage={10} /></Card>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-surface border border-border/40 rounded-[2rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">{editItem ? 'Edit Varietas' : 'Tambah Varietas Baru'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nama Varietas" name="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Select label="Jenis Tanaman" name="crop_type" required value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })} error={errors.crop_type}>
                <option value="">-- Pilih --</option>{cropTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
              <Select label="Satuan Hasil" name="unit" required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} error={errors.unit}>
                <option value="">-- Pilih Satuan --</option>{units.map(u => <option key={u._id} value={u._id}>{u.name} ({u.symbol})</option>)}
              </Select>
              <Select label="Status" name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['Active', 'Inactive'].map(s => <option key={s} value={s}>{s === 'Active' ? 'Aktif' : 'Tidak Aktif'}</option>)}</Select>
              <div className="flex flex-col gap-1.5 col-span-2"><label className="text-[10px] font-bold text-muted uppercase tracking-wider">Deskripsi <span className="text-muted/50 font-normal normal-case">(Optional)</span></label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={2} /></div>
            </div>
            <div className="mt-6 p-4 rounded-2xl border border-border/40 bg-background/30">
              <p className="text-xs font-black text-foreground uppercase tracking-wider mb-3">Grade (tanpa batas)</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Input label="Nama Grade" name="grade_name" value={gradeForm.grade_name} onChange={e => setGradeForm({ ...gradeForm, grade_name: e.target.value })} placeholder="A, Premium..." />
                <Input label="Harga/Unit" name="estimated_price_per_unit" type="number" value={gradeForm.estimated_price_per_unit} onChange={e => setGradeForm({ ...gradeForm, estimated_price_per_unit: e.target.value })} placeholder="15000" />
                <div className="flex items-end"><button onClick={addGrade} className="w-full px-3 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">{gradeEditIdx !== null ? 'Perbarui Grade' : 'Tambah Grade'}</button></div>
              </div>
              {grades.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {grades.map((g, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-border/30 text-sm">
                      <span><b>{g.grade_name}</b> — Rp {Number(g.estimated_price_per_unit).toLocaleString('id-ID')}</span>
                      <div className="flex gap-1"><button onClick={() => editGrade(idx)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => deleteGrade(idx)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-muted italic">Belum ada grade. Tambahkan minimal satu jika perlu.</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold">Batal</button><button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">Simpan</button></div>
          </div>
        </div>
      )}
      {viewModal && <ViewDetailModal isOpen={!!viewModal} onClose={() => setViewModal(null)} record={{ ...viewModal, crop_type: viewModal.crop_type?.name, unit: viewModal.unit ? `${viewModal.unit.name} (${viewModal.unit.symbol})` : '-', grades: (viewModal.grades || []).map(g => `${g.grade_name}: Rp ${Number(g.estimated_price_per_unit).toLocaleString('id-ID')}`).join(', ') || '-' }} columns={[...columns, { header: 'Deskripsi', accessor: 'description' }, { header: 'Detail Grade', accessor: 'grades' }]} title="Detail Varietas" />}
    </div>
  );
};
export default CropVarietyMasterPage;
