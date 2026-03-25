import React, { useState } from 'react';

const RecordSaleModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    farm_id: '',
    crop_cycle_id: '',
    buyer_name: '',
    buyer_type: 'Mill',
    quantity_kg: '',
    price_per_kg: '',
    sale_date: new Date().toISOString().split('T')[0],
    transport_notes: '',
    invoice_ref: '',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const totalRevenue = formData.quantity_kg && formData.price_per_kg
    ? (parseFloat(formData.quantity_kg) * parseFloat(formData.price_per_kg)).toLocaleString('id-ID')
    : '0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Catat Penjualan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm / Blok *</label>
              <select required name="farm_id" value={formData.farm_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">-- Pilih Farm --</option>
                <option value="farm_1">Blok A - Sumatra</option>
                <option value="farm_2">Blok B - Kalimantan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Siklus Tanam *</label>
              <select required name="crop_cycle_id" value={formData.crop_cycle_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">-- Pilih Siklus --</option>
                <option value="cycle_1">Sawit 2026</option>
                <option value="cycle_2">Kopi 2026</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembeli *</label>
              <input required name="buyer_name" value={formData.buyer_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="PT Maju Jaya" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pembeli *</label>
              <select name="buyer_type" value={formData.buyer_type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500">
                <option value="Mill">Pabrik (Mill)</option>
                <option value="Middleman">Tengkulak</option>
                <option value="Direct">Langsung</option>
                <option value="Government">Pemerintah</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Kg) *</label>
              <input required type="number" name="quantity_kg" value={formData.quantity_kg} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="0" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga/Kg (Rp) *</label>
              <input required type="number" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="0" min="0" />
            </div>
          </div>
          {/* Auto-computed total */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-600 font-semibold uppercase">Total Pendapatan (Otomatis)</p>
            <p className="text-xl font-black text-orange-700">Rp {totalRevenue}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jual *</label>
            <input required type="date" name="sale_date" value={formData.sale_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ref. Invoice</label>
              <input name="invoice_ref" value={formData.invoice_ref} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="INV-2026-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Transportasi</label>
              <input name="transport_notes" value={formData.transport_notes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="Truk B 1234 CD" />
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
