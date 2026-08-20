import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

const MasterDataModal = ({ isOpen, onClose, onSubmit, initialData, columns, title }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaultState = {};
      columns.forEach(col => {
        if (col.accessor !== '_id' && col.accessor !== 'no' && col.header !== 'No') {
          defaultState[col.accessor] = '';
        }
      });
      setFormData(defaultState);
    }
  }, [initialData, columns, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl animate-fade-in transition-all duration-500">
      <div className="bg-surface border border-border/40 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] w-full max-w-lg overflow-hidden animate-scale-in relative">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        
        <div className="px-8 pt-10 pb-6 flex justify-between items-start relative">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {initialData ? 'Edit Data' : 'Tambah Data'}
              </h2>
            </div>
            <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ml-4 leading-none">
              Module: {title}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-background border border-border/60 hover:border-rose-500/50 text-muted hover:text-rose-500 rounded-2xl transition-all duration-300 hover:rotate-90 hover:shadow-lg hover:shadow-rose-500/10 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-6">
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {columns.map((col, index) => {
              if (col.accessor === '_id' || col.accessor === 'no' || col.header === 'No') return null;
              
              const isNumber = ['jumlah', 'harga', 'penduduk', 'tahun', 'persen', 'kg', 'ton'].some(str => col.accessor.toLowerCase().includes(str));
              
              return (
                <div key={index} className="flex flex-col gap-2 group">
                  <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest px-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                    {col.header}
                    {isNumber && <span className="text-[9px] font-bold text-primary/40 leading-none"># numeric</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={isNumber ? 'number' : 'text'}
                      name={col.accessor}
                      value={formData[col.accessor] || ''}
                      onChange={handleChange}
                      placeholder={`Masukkan ${col.header}...`}
                      className="w-full bg-background/30 border border-border/80 hover:border-border rounded-2xl px-5 py-3.5 text-sm font-semibold text-foreground placeholder:text-muted/30 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="pt-6 flex gap-3 border-t border-border/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black text-muted uppercase tracking-widest hover:text-foreground hover:bg-background/80 rounded-2xl transition-all border border-transparent hover:border-border/40 active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[1.5] py-4 bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterDataModal;

