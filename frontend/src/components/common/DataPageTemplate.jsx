import React, { useState } from 'react';
import * as xlsx from 'xlsx';
import { Download, Upload, Plus, RefreshCw, X } from 'lucide-react';
import DataTable from './DataTable';
import Card from './Card';

const fieldType = (accessor) => {
  const s = accessor.toLowerCase();
  if (s.includes('date') || s.includes('tanggal')) return 'date';
  if (s.includes('harga') || s.includes('jumlah') || s.includes('penduduk') || s.includes('kg') || s.includes('ton') || s.includes('idr') || s.includes('persen') || s.includes('skor') || s.includes('pelaksana') || s.includes('cppd') || s.includes('koefisien')) return 'number';
  if (s.includes('tahun')) return 'number';
  return 'text';
};

const DataPageTemplate = ({ title, subtitle, columns, data, loading, error, insightText, onRefresh, onImport, onAdd, onDelete, notification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({});

  const handleExport = () => {
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Data");
    xlsx.writeFile(wb, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = xlsx.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const importedData = xlsx.utils.sheet_to_json(ws);
      if (importedData && importedData.length > 0) {
        if (onImport) onImport(importedData);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const openAddForm = () => {
    const initial = {};
    columns.forEach(col => {
      if (typeof col.accessor === 'string') initial[col.accessor] = '';
    });
    setForm(initial);
    setShowAddModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const cleaned = {};
    Object.keys(form).forEach(k => {
      const val = form[k];
      cleaned[k] = fieldType(k) === 'number' && val !== '' ? Number(val) : val;
    });
    if (onAdd) onAdd(cleaned);
    setShowAddModal(false);
  };

  const tableColumns = [...columns];
  if (onDelete) {
    tableColumns.push({ header: '', accessor: (row) => (
      <button onClick={() => onDelete(row._id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors" title="Hapus">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    ), sortable: false });
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12">
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold animate-slide-up">
          {notification}
        </div>
      )}

      <div className="bg-surface/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/40 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted text-xs mt-1 font-bold opacity-50 uppercase tracking-widest">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onRefresh} disabled={loading} className="flex items-center gap-2 bg-background border border-border/60 hover:border-primary/50 text-foreground px-4 py-2.5 rounded-xl transition-colors font-bold text-xs shadow-sm min-h-[44px] disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={openAddForm} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl transition-colors font-bold text-xs shadow-sm min-h-[44px]">
              <Plus className="w-4 h-4" />
              Tambah
            </button>
            <label className="cursor-pointer flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl transition-colors font-bold text-xs ring-1 ring-primary/20 min-h-[44px]">
              <Upload className="w-4 h-4" />
              Import
              <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleImportFile} hidden />
            </label>
            <button onClick={handleExport} className="flex items-center gap-2 bg-background border border-border/60 hover:border-primary/50 text-foreground px-4 py-2.5 rounded-xl transition-colors font-bold text-xs shadow-sm min-h-[44px]">
              <Download className="w-4 h-4 text-primary" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            Gagal memuat data: {error}
          </div>
        ) : (
          <DataTable columns={tableColumns} data={data} showSearch={true} itemsPerPage={10} />
        )}
      </div>

      <Card title="Insight Palace" className="border-primary/20 bg-primary/[0.02]">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-line">
            {insightText || "Sistem AI sedang menganalisis data ini untuk memberikan insight mendalam mengenai tren ketahanan pangan, proyeksi harga, dan anomali pasar."}
          </p>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-lg bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-foreground">Tambah Data Baru</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border/40 hover:border-primary transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              {columns.filter(c => typeof c.accessor === 'string').map((col) => (
                <div key={col.accessor} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider">{col.header}</label>
                  <input
                    type={fieldType(col.accessor)}
                    value={form[col.accessor] || ''}
                    onChange={e => setForm(f => ({ ...f, [col.accessor]: e.target.value }))}
                    className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="min-h-[44px] px-4 py-2 border border-border/40 rounded-xl text-sm font-bold hover:bg-surface/50 transition-all">Batal</button>
                <button type="submit" className="min-h-[44px] px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPageTemplate;
