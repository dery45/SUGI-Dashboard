import React, { useState, useEffect } from 'react';
import Card from './Card';
import DataTable from './DataTable';
import MasterDataModal from './MasterDataModal';
import DataImportModal from '../DataImportModal';
import { useMasterData } from '../../hooks/useMasterData';
import { PlusCircle, Lightbulb, RefreshCw, Upload, CheckCircle } from 'lucide-react';

const LiveDataPage = ({ title, columns, endpointContext, importTemplate }) => {
  const { data, loading, error, fetchData, createData, updateData, deleteData } = useMasterData(endpointContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-dismiss success message after 5s
  useEffect(() => {
    if (importSuccessMessage) {
      const timer = setTimeout(() => setImportSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [importSuccessMessage]);

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      await deleteData(id);
    }
  };

  const handleSubmit = async (formData) => {
    if (selectedItem && selectedItem._id) {
      await updateData(selectedItem._id, formData);
    } else {
      await createData(formData);
    }
    setIsModalOpen(false);
  };

  const handleImportSuccess = (result) => {
    setImportSuccessMessage(
      `Import berhasil! ${result.insertedCount} data ditambahkan, ${result.modifiedCount} data diperbarui.`
    );
    fetchData(); // Refresh table
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12 w-full">
      <div className="bg-surface/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/40 flex flex-col md:flex-row gap-4 shadow-sm items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
          <p className="text-muted text-xs mt-1 font-bold opacity-50 uppercase tracking-widest">Master Data Management</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchData} className="flex items-center gap-2 bg-background border border-border/60 hover:border-primary/50 text-foreground px-4 py-2 rounded-xl transition-colors font-bold text-xs shadow-sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {importTemplate && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-bold text-xs shadow-md shadow-emerald-600/20"
              disabled={loading}
            >
              <Upload className="w-4 h-4" />
              Import CSV/Excel
            </button>
          )}
          <button onClick={handleAdd} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-colors font-bold text-xs shadow-md shadow-primary/20" disabled={loading}>
            <PlusCircle className="w-4 h-4" />
            Tambah Data
          </button>
        </div>
      </div>

      {importSuccessMessage && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-5 py-3 rounded-xl text-sm font-medium">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {importSuccessMessage}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg text-sm font-medium">
          Error: {error}
        </div>
      )}

      <div className="w-full relative">
        <DataTable 
          columns={columns} 
          data={data} 
          showSearch={true} 
          itemsPerPage={10} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {loading && data.length === 0 && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-[1.5rem] p-12">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </div>

      <Card title="Insight Palace 🧠" className="border-primary/20 bg-primary/[0.02]">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-line">
            Sistem API Terkoneksi: Data real-time ditarik dari database backend terpusat. Perubahan data yang dilakukan akan langsung disinkronisasi.
            {importTemplate && '\n\nImport CSV/Excel: Gunakan tombol "Import CSV/Excel" untuk mengunggah data dalam jumlah besar sekaligus. Pastikan format file sesuai dengan template yang ditentukan.'}
          </p>
        </div>
      </Card>

      <MasterDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedItem}
        columns={columns}
        title={title}
      />

      {importTemplate && (
        <DataImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          template={importTemplate}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};

export default LiveDataPage;
