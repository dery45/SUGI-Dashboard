import React, { useState } from 'react';

const CROP_TYPES = [
  { value: 'Oil_Palm', label: 'Kelapa Sawit' },
  { value: 'Coffee', label: 'Kopi' },
  { value: 'Rice', label: 'Padi' },
];

const NewCycleModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    farm_id: '',
    crop_type: 'Oil_Palm',
    variety: '',
    planting_density: '',
    expected_yield_kg: '',
    planned_start_date: new Date().toISOString().split('T')[0],
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
          <h2 className="text-xl font-bold text-gray-800">Buat Siklus Tanam Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm / Lahan *</label>
            <select required name="farm_id" value={formData.farm_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Pilih Farm --</option>
              <option value="farm_1">Blok A - Sumatra</option>
              <option value="farm_2">Blok B - Kalimantan</option>
              <option value="farm_3">Blok C - Sulawesi</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Tanaman *</label>
              <select required name="crop_type" value={formData.crop_type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500">
                {CROP_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Varietas</label>
              <input name="variety" value={formData.variety} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Tenera, DxP, dll" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kepadatan (pohon/ha)</label>
              <input type="number" name="planting_density" value={formData.planting_density} onChange={handleChange} min="1" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="143" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Hasil (Kg)</label>
              <input type="number" name="expected_yield_kg" value={formData.expected_yield_kg} onChange={handleChange} min="0" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="5000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rencana Mulai *</label>
            <input required type="date" name="planned_start_date" value={formData.planned_start_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm shadow-sm disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Buat Siklus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCycleModal;
