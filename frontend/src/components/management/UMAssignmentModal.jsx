import React, { useState } from 'react';

const UMAssignmentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    um_id: '',
    assigned_processes: [],
    assigned_farms: [],
    start_date: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProcessToggle = (process) => {
    setFormData(prev => {
      const current = prev.assigned_processes;
      if (current.includes(process)) return { ...prev, assigned_processes: current.filter(p => p !== process) };
      return { ...prev, assigned_processes: [...current, process] };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold font-inter text-gray-800">Tambah Penugasan UM</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input required name="user_id" onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Pilih User" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UM ID (Custom)</label>
              <input required name="um_id" onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="UM-001" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proses yang Ditugaskan</label>
            <div className="flex flex-wrap gap-2">
              {['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting', 'Distribution'].map(proc => (
                <button
                  type="button"
                  key={proc}
                  onClick={() => handleProcessToggle(proc)}
                  className={`px-3 py-1 text-sm border rounded-full transition ${
                    formData.assigned_processes.includes(proc) 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {proc.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai Tugas</label>
             <input type="date" required name="start_date" onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 font-medium">Batal</button>
             <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-medium shadow-md hover:bg-green-700">Simpan Penugasan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UMAssignmentModal;
