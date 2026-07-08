import React from 'react';
import { Download } from 'lucide-react';

const ExportButton = ({ data, filename, columns, disabled }) => {
  const handleExport = () => {
    if (!data?.length || !columns?.length) return;

    const headers = columns.map(c => c.header || c);
    const rows = data.map(row =>
      headers.map(h => {
        const col = columns.find(c => c.header === h || c === h);
        const accessor = typeof col === 'object' ? col.accessor : col;
        const val = row[accessor];
        return val !== null && val !== undefined ? String(val).replace(/,/g, '') : '';
      })
    );

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data?.length}
      className="flex items-center gap-2 px-3 py-2 bg-background/60 border border-border/50 text-foreground rounded-xl text-xs font-bold hover:bg-background/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
};

export default ExportButton;
