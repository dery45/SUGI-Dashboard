import React, { useState } from 'react';
import * as xlsx from 'xlsx';
import { Download, Upload, Lightbulb } from 'lucide-react';
import DataTable from './DataTable';
import Card from './Card';

const DataPageTemplate = ({ title, columns, initialData, insightText }) => {
  const [data, setData] = useState(initialData);

  const handleExport = () => {
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Data");
    xlsx.writeFile(wb, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  const handleImport = (e) => {
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
        setData(importedData);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12">
      <div className="bg-surface/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/40 flex flex-col gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
          <p className="text-muted text-xs mt-1 font-bold opacity-50 uppercase tracking-widest">Master Data Management</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl transition-colors font-bold text-xs ring-1 ring-primary/20">
            <Upload className="w-4 h-4" />
            Import (CSV/Excel)
            <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleImport} hidden />
          </label>
          <button onClick={handleExport} className="flex items-center gap-2 bg-background border border-border/60 hover:border-primary/50 text-foreground px-4 py-2 rounded-xl transition-colors font-bold text-xs shadow-sm">
            <Download className="w-4 h-4 text-primary" />
            Export (CSV/Excel)
          </button>
        </div>
      </div>

      <div className="w-full">
        <DataTable columns={columns} data={data} showSearch={true} itemsPerPage={10} />
      </div>

      {/* Insight Palace */}
      <Card title="Insight Palace 🧠" className="border-primary/20 bg-primary/[0.02]">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-line">
            {insightText || "Sistem AI sedang menganalisis data ini untuk memberikan insight mendalam mengenai tren ketahanan pangan, proyeksi harga, dan anomali pasar. Pola musiman menunjukkan korelasi yang signifikan dengan fluktuasi harga di tingkat produsen."}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DataPageTemplate;
