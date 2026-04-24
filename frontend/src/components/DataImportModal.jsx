import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, AlertCircle, CheckCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DataImportModal({ isOpen, onClose, template, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Reset state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setData([]);
      setErrors([]);
      setIsLoading(false);
      setImportResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (fileToProcess) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw data from first sheet
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        validateAndFormatData(rawData);
      } catch (err) {
        setErrors([{ row: 0, message: 'Gagal membaca file. Pastikan format file benar (.csv atau .xlsx)' }]);
      }
    };
    reader.readAsArrayBuffer(fileToProcess);
  };

  const validateAndFormatData = (rawData) => {
    const newErrors = [];
    const formattedData = [];

    // Check if empty
    if (rawData.length === 0) {
      newErrors.push({ row: 0, message: 'File kosong atau tidak memiliki data.' });
      setErrors(newErrors);
      return;
    }

    // Validate headers
    const actualHeaders = Object.keys(rawData[0]);
    const missingHeaders = template.columns
      .filter((col) => col.required)
      .filter((col) => !actualHeaders.includes(col.header));

    if (missingHeaders.length > 0) {
      newErrors.push({
        row: 0,
        message: `Kolom wajib tidak ditemukan: ${missingHeaders.map((c) => c.header).join(', ')}`
      });
      setErrors(newErrors);
      return;
    }

    // Validate each row
    rawData.forEach((row, index) => {
      const rowNum = index + 1; // Actual row number in spreadsheet (excluding header)
      const formattedRow = {};
      let hasError = false;

      template.columns.forEach((col) => {
        let val = row[col.header];
        
        // Check required
        if (col.required && (val === undefined || val === null || val === '')) {
          newErrors.push({ row: rowNum, column: col.header, message: 'Kolom wajib diisi' });
          hasError = true;
        }

        // Format and Type Check
        if (val !== undefined && val !== null && val !== '') {
          if (col.type === 'number') {
            const numVal = Number(val);
            if (isNaN(numVal)) {
              newErrors.push({ row: rowNum, column: col.header, message: 'Harus berupa angka' });
              hasError = true;
            } else {
              formattedRow[col.field] = numVal;
            }
          } else {
            formattedRow[col.field] = String(val).trim();
          }
        }
      });

      formattedRow._originalRow = rowNum;
      formattedRow._hasError = hasError;
      
      // Keep track of the row to display in preview, filtering out skipped fields if any (optional)
      const rowToSave = { ...formattedRow };
      template.columns.forEach(c => {
        if (c.skipInDb) {
           delete rowToSave[c.field];
        }
      });

      formattedData.push(rowToSave);
    });

    setErrors(newErrors);
    setData(formattedData);
  };

  const handleImport = async () => {
    if (errors.length > 0) return;
    
    setIsLoading(true);
    try {
      // Remove metadata keys before sending
      const payload = data.map(row => {
        const cleanRow = { ...row };
        delete cleanRow._originalRow;
        delete cleanRow._hasError;
        return cleanRow;
      });

      const response = await fetch(`${API_BASE_URL}/bulk-import/${template.modelName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan saat import data');
      }

      const result = await response.json();
      setImportResult(result);
      onImportSuccess(result);
      // Small delay to show success before closing
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setErrors([{ row: 0, message: err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Import Data CSV/Excel</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!file ? (
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-2">Pilih file atau seret ke sini</p>
              <p className="text-slate-400 text-sm">Mendukung format .csv atau .xlsx</p>
              <div className="mt-5 text-left inline-block">
                <p className="text-xs text-slate-500 bg-slate-100 py-2 px-4 rounded-t-lg border-b border-slate-200 font-semibold">
                  Kolom yang Dibutuhkan untuk: {template.modelName}
                </p>
                <div className="bg-slate-50 py-2 px-4 rounded-b-lg flex flex-wrap gap-2">
                  {template.columns.map(col => (
                    <span key={col.field} className={`text-xs px-2 py-1 rounded-full ${
                      col.required ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {col.header} {col.required ? '*' : ''}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">* = wajib diisi</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB • {data.length} Baris Data</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setData([]);
                    setErrors([]);
                  }}
                  className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg"
                >
                  Ganti File
                </button>
              </div>

              {errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-rose-700 font-bold mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>Ditemukan {errors.length} Kesalahan Validasi</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-rose-600 space-y-1 max-h-32 overflow-y-auto pl-2">
                    {errors.map((err, i) => (
                      <li key={i}>
                        {err.row > 0 ? `Baris ${err.row}: ` : ''}
                        {err.column ? `[${err.column}] ` : ''}
                        {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3">Preview Data</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-600 uppercase bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 border-b">Baris</th>
                            {template.columns.filter(c => !c.skipInDb).map(col => (
                              <th key={col.field} className="px-4 py-3 border-b">{col.header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.slice(0, 100).map((row, idx) => (
                            <tr key={idx} className={`border-b ${row._hasError ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                              <td className="px-4 py-3 text-slate-500 font-medium">
                                {row._originalRow}
                                {row._hasError && <AlertCircle className="w-4 h-4 text-rose-500 inline ml-2" />}
                              </td>
                              {template.columns.filter(c => !c.skipInDb).map(col => (
                                <td key={col.field} className={`px-4 py-3 ${errors.some(e => e.row === row._originalRow && e.column === col.header) ? 'text-rose-600 font-medium' : 'text-slate-700'}`}>
                                  {row[col.field]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {data.length > 100 && (
                      <div className="bg-slate-50 p-3 text-center text-sm text-slate-500 border-t border-slate-200">
                        Menampilkan 100 dari {data.length} baris
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          {importResult && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-emerald-700 font-medium text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>
                Import berhasil! <strong>{importResult.insertedCount}</strong> data ditambahkan,{' '}
                <strong>{importResult.modifiedCount}</strong> data diperbarui.
              </span>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {importResult ? 'Tutup' : 'Batal'}
            </button>
            {!importResult && (
              <button
                onClick={handleImport}
                disabled={!file || errors.length > 0 || isLoading}
                className="px-5 py-2.5 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isLoading ? 'Mengimport...' : 'Konfirmasi Import'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
