import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ columns, data, title, subtitle, showSearch = true, itemsPerPage = 8 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const processedData = useMemo(() => {
    let result = [...data];

    // Search logic
    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort logic
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentItems = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-primary" /> : 
      <ChevronDown className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-2">
        <div className="flex flex-col gap-0.5">
          {title && (
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_12px_rgba(16,185,129,0.2)]" />
              <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
            </div>
          )}
          {subtitle && <p className="text-muted text-[11px] font-medium ml-4 opacity-60 tracking-normal leading-tight">{subtitle}</p>}
        </div>

        {showSearch && (
          <div className="relative max-w-xs w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-surface/40 backdrop-blur-sm border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden border border-border/40 rounded-[1.5rem] bg-surface/30 backdrop-blur-md shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/20 bg-background/20 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                {columns.map((col, index) => (
                  <th 
                    key={index} 
                    className={`px-6 py-4 cursor-pointer hover:bg-primary/5 transition-colors group/th ${col.sortable !== false ? '' : 'cursor-default'}`}
                    onClick={() => col.sortable !== false && requestSort(col.accessor)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="transition-colors group-hover/th:text-primary">
                        {col.header}
                      </span>
                      {col.sortable !== false && getSortIcon(col.accessor)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {currentItems.map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-primary/[0.01] transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-3.5">
                      <span className={`text-[13px] ${colIndex === 0 ? 'font-bold text-foreground' : 'font-medium text-muted-foreground/80'}`}>
                        {row[col.accessor] === null ? '-' : (col.format ? col.format(row[col.accessor]) : row[col.accessor])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {processedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-muted text-xs italic">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-background/10 border-t border-border/10">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-50">
              Halaman <span className="text-primary">{currentPage}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border/40 hover:border-primary hover:text-primary disabled:opacity-20 transition-all duration-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 mx-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all duration-300 ${currentPage === i + 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted hover:bg-primary/5 hover:text-primary'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border/40 hover:border-primary hover:text-primary disabled:opacity-20 transition-all duration-300"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
