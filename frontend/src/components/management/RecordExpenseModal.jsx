import React, { useState } from 'react';

const CATEGORIES = ['Fertilizer', 'Labor', 'Transport', 'Equipment', 'Pesticide', 'Land_Rent', 'Other'];
const CATEGORY_LABELS = {
  Fertilizer: 'Pupuk', Labor: 'Tenaga Kerja', Transport: 'Transportasi',
  Equipment: 'Peralatan', Pesticide: 'Pestisida', Land_Rent: 'Sewa Lahan', Other: 'Lainnya',
};

const RecordExpenseModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    farm_id: '', crop_cycle_id: '', category: 'Labor',
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Catat Pengeluaran</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm / Blok *</label>
              <select required name="farm_id" value={formData.farm_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">-- Pilih Farm --</option>
                <option value="farm_1">Blok A</option>
                <option value="farm_2">Blok B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <select required name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
            <input required type="number" name="amount_idr" value={formData.amount_idr} onChange={handleChange} min="0" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <input name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Pembelian pupuk urea 50kg..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
              <input required type="date" name="expense_date" value={formData.expense_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ref. Kwitansi</label>
              <input name="receipt_ref" value={formData.receipt_ref} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="KWT-001" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 text-sm shadow-sm disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordExpenseModal;
