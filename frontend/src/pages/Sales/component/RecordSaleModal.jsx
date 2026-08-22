import React, { useState } from 'react';
import { required, isNumber, minValue, validateForm } from '@/utils/validation';

const BUYER_LABELS = { Mill: 'Pabrik', Middleman: 'Tengkulak', Direct: 'Langsung', Government: 'Pemerintah' };

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

  const inputCls = "w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500";
  const errCls = (name) => (errors[name] ? 'text-xs text-red-600 mt-1' : '');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content-enter">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Catat Penjualan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm *</label>
              <select required name="farm_id" value={formData.farm_id} onChange={handleChange} className={inputCls}>
                <option value="">-- Pilih Farm --</option>
                {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
              {errors.farm_id && <p className={errCls('farm_id')}>{errors.farm_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pembeli *</label>
              <select name="buyer_type" value={formData.buyer_type} onChange={handleChange} className={inputCls}>
                {Object.entries(BUYER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembeli *</label>
            <input required name="buyer_name" value={formData.buyer_name} onChange={handleChange} className={inputCls} placeholder="PT Maju Jaya" />
            {errors.buyer_name && <p className={errCls('buyer_name')}>{errors.buyer_name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Kg) *</label>
              <input required type="number" name="quantity_kg" value={formData.quantity_kg} onChange={handleChange} className={inputCls} placeholder="0" min="0" />
              {errors.quantity_kg && <p className={errCls('quantity_kg')}>{errors.quantity_kg}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga/Kg (Rp) *</label>
              <input required type="number" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} className={inputCls} placeholder="0" min="0" />
              {errors.price_per_kg && <p className={errCls('price_per_kg')}>{errors.price_per_kg}</p>}
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-600 font-semibold uppercase">Total Pendapatan (Otomatis)</p>
            <p className="text-xl font-black text-orange-700">Rp {totalRevenue}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jual *</label>
            <input required type="date" name="sale_date" value={formData.sale_date} onChange={handleChange} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ref. Invoice</label>
              <input name="invoice_ref" value={formData.invoice_ref} onChange={handleChange} className={inputCls} placeholder="INV-2026-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Transportasi</label>
              <input name="transport_notes" value={formData.transport_notes} onChange={handleChange} className={inputCls} placeholder="Truk B 1234 CD" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-sm shadow-sm disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Konfirmasi Penjualan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordSaleModal;