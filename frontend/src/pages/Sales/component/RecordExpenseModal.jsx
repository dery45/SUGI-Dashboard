import React, { useState } from 'react';

const CATEGORIES = ['Bibit', 'Pupuk', 'Pestisida', 'Tenaga Kerja', 'Transportasi', 'Peralatan', 'Sewa Lahan', 'Lainnya'];

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

const RecordExpenseModal = ({ isOpen, onClose, onSave, farms = [] }) => {
  const [formData, setFormData] = useState({
    farm_id: '', crop_cycle_id: '', category: 'Tenaga Kerja',
    amount_idr: '', description: '', expense_date: new Date().toISOString().split('T')[0], receipt_ref: ''
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(formData); onClose(); } finally { setSaving(false); }
  };

  return (
    <Modal title="Catat Pengeluaran" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FF label="Farm *"><select name="farm_id" value={formData.farm_id} onChange={handleChange} required className={inputCls}><option value="">Pilih Farm</option>{farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}</select></FF>
          <FF label="Kategori *"><select name="category" value={formData.category} onChange={handleChange} required className={inputCls}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></FF>
        </div>
        <FF label="Jumlah (Rp) *"><input type="number" name="amount_idr" value={formData.amount_idr} onChange={handleChange} required min="0" placeholder="0" className={inputCls} /></FF>
        <FF label="Deskripsi"><input name="description" value={formData.description} onChange={handleChange} placeholder="Pembelian pupuk urea 50kg..." className={inputCls} /></FF>
        <div className="grid grid-cols-2 gap-4">
          <FF label="Tanggal *"><input type="date" name="expense_date" value={formData.expense_date} onChange={handleChange} required className={inputCls} /></FF>
          <FF label="Ref. Kwitansi"><input name="receipt_ref" value={formData.receipt_ref} onChange={handleChange} placeholder="KWT-001" className={inputCls} /></FF>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button type="button" onClick={onClose} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
          <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Pengeluaran'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordExpenseModal;