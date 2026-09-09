import React, { useState } from 'react';
import { required, isNumber, minValue, validateForm } from '@/utils/validation';

const BUYER_LABELS = { Mill: 'Pabrik', Middleman: 'Tengkulak', Direct: 'Langsung', Government: 'Pemerintah' };

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

const RecordSaleModal = ({ isOpen, onClose, onSave, farms = [] }) => {
  const [formData, setFormData] = useState({
    farm_id: '',
    buyer_name: '',
    buyer_type: 'Direct',
    quantity_kg: '',
    price_per_kg: '',
    sale_date: new Date().toISOString().split('T')[0],
    transport_notes: '',
    invoice_ref: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };
  const totalRevenue = formData.quantity_kg && formData.price_per_kg
    ? (parseFloat(formData.quantity_kg) * parseFloat(formData.price_per_kg)).toLocaleString('id-ID')
    : '0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: fieldErrors, hasErrors } = validateForm(formData, {
      farm_id: [[required, 'Farm']],
      buyer_name: [[required, 'Nama Pembeli']],
      quantity_kg: [[isNumber, 'Jumlah (Kg)'], [minValue, 0, 'Jumlah (Kg)']],
      price_per_kg: [[isNumber, 'Harga/Kg'], [minValue, 0, 'Harga/Kg']]
    });
    setErrors(fieldErrors);
    if (hasErrors) return;
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Catat Penjualan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FF label="Farm *"><select name="farm_id" value={formData.farm_id} onChange={handleChange} required className={inputCls}><option value="">Pilih Farm</option>{farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}</select>{errors.farm_id && <p className="text-destructive text-xs font-semibold">{errors.farm_id}</p>}</FF>
          <FF label="Tipe Pembeli *"><select name="buyer_type" value={formData.buyer_type} onChange={handleChange} className={inputCls}>{Object.entries(BUYER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></FF>
        </div>
        <FF label="Nama Pembeli *"><input name="buyer_name" value={formData.buyer_name} onChange={handleChange} required placeholder="PT Maju Jaya" className={inputCls} />{errors.buyer_name && <p className="text-destructive text-xs font-semibold">{errors.buyer_name}</p>}</FF>
        <div className="grid grid-cols-2 gap-4">
          <FF label="Jumlah (Kg) *"><input type="number" name="quantity_kg" value={formData.quantity_kg} onChange={handleChange} required min="0" placeholder="0" className={inputCls} />{errors.quantity_kg && <p className="text-destructive text-xs font-semibold">{errors.quantity_kg}</p>}</FF>
          <FF label="Harga/Kg (Rp) *"><input type="number" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} required min="0" placeholder="0" className={inputCls} />{errors.price_per_kg && <p className="text-destructive text-xs font-semibold">{errors.price_per_kg}</p>}</FF>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-primary uppercase">Total Pendapatan (Otomatis)</p>
          <p className="text-xl font-black text-primary">Rp {totalRevenue}</p>
        </div>
        <FF label="Tanggal Jual *"><input type="date" name="sale_date" value={formData.sale_date} onChange={handleChange} required className={inputCls} /></FF>
        <div className="grid grid-cols-2 gap-4">
          <FF label="Ref. Invoice"><input name="invoice_ref" value={formData.invoice_ref} onChange={handleChange} placeholder="INV-2026-001" className={inputCls} /></FF>
          <FF label="Catatan Transportasi"><input name="transport_notes" value={formData.transport_notes} onChange={handleChange} placeholder="Truk B 1234 CD" className={inputCls} /></FF>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button type="button" onClick={onClose} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
          <button type="submit" disabled={saving} className="min-h-[44px] px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50">{saving ? 'Menyimpan...' : 'Konfirmasi Penjualan'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordSaleModal;