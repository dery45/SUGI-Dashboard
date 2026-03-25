import React, { useState } from 'react';

const LandOpeningModal = ({ isOpen, onClose, onSave, farms = [], cropCycles = [] }) => {
  const [formData, setFormData] = useState({
    farm_id: '',
    crop_cycle_id: '',
    land_opening_date: new Date().toISOString().split('T')[0],
    clearing_cost: 0,
    um_responsible_id: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Buka Lahan Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Farm/Plot</label>
            <select 
              required 
              name="farm_id" 
              value={formData.farm_id} 
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Farm --</option>
              <option value="farm_1">Blok A - Sumatra</option>
              <option value="farm_2">Blok B - Kalimantan</option>
              {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Siklus Tanam (Cycle)</label>
            <select 
              required 
              name="crop_cycle_id" 
              value={formData.crop_cycle_id} 
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Siklus --</option>
              <option value="cycle_1">Siklus Sawit 2026</option>
              {cropCycles.map(c => <option key={c._id} value={c._id}>{c.crop_type} - {c._id}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Buka Lahan</label>
              <input 
                type="date" 
                required 
                name="land_opening_date" 
                value={formData.land_opening_date} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Pembersihan (Rp)</label>
              <input 
                type="number" 
                name="clearing_cost" 
                value={formData.clearing_cost} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 font-medium">Batal</button>
             <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium shadow-md hover:bg-blue-700">Simpan & Buka Lahan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandOpeningModal;
