import React, { useCallback, useRef } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, Image, X, Printer } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, data, title }) => {
  const modalRef = useRef(null);

  const exportCSV = useCallback(() => {
    if (!data) return;
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${title || 'export'}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [data, title]);

  const exportJSON = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${title || 'export'}.json`; a.click();
    URL.revokeObjectURL(url);
  }, [data, title]);

  const exportPNG = useCallback(async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.querySelector('.chatbot-dashboard-content') || document.body;
    const canvas = await html2canvas(element, { backgroundColor: '#0f0f1a', scale: 2 });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${title || 'dashboard'}.png`;
    a.click();
  }, [title]);

  const exportPDF = useCallback(async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    const element = document.querySelector('.chatbot-dashboard-content') || document.body;
    const canvas = await html2canvas(element, { backgroundColor: '#0f0f1a', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title || 'dashboard'}.pdf`);
  }, [title]);

  if (!isOpen) return null;

  const options = [
    { label: 'PNG Image', icon: Image, action: exportPNG, desc: 'Screenshot dashboard' },
    { label: 'PDF Document', icon: Printer, action: exportPDF, desc: 'Full page export' },
    { label: 'CSV File', icon: FileSpreadsheet, action: exportCSV, desc: 'Tabular data' },
    { label: 'Excel File', icon: FileText, action: () => exportCSV(), desc: 'Open in Excel (CSV)' },
    { label: 'JSON File', icon: FileJson, action: exportJSON, desc: 'Raw data format' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div ref={modalRef} className="bg-surface/95 backdrop-blur-2xl border border-border/40 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Ekspor Data</h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">Pilih format ekspor</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background/60 rounded-xl transition-colors text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <button key={i} onClick={opt.action}
              className="w-full flex items-center gap-4 p-4 bg-background/40 hover:bg-background/60 rounded-2xl border border-border/20 transition-all group text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <opt.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted font-medium">{opt.desc}</p>
              </div>
              <Download className="w-4 h-4 text-muted/40 group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
