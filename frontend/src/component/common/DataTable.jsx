import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit2, Trash2 } from 'lucide-react';

const PAGE_SIZES = [5, 10, 20, 50];

const DataTable = ({ columns, data, title, subtitle, showSearch = true, itemsPerPage: defaultItemsPerPage = 8, onEdit, onDelete, onView, editCondition, deleteCondition, viewCondition }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    PAGE_SIZES.includes(defaultItemsPerPage) ? defaultItemsPerPage : PAGE_SIZES[1]
  );

  const processedData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig.key) {
      const sortFn = typeof sortConfig.key === 'function' ? sortConfig.key : (row) => row[sortConfig.key];
      result.sort((a, b) => {
        const aValue = sortFn(a);
        const bValue = sortFn(b);
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const currentItems = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
      <ChevronUp className="w-4 h-4 text-foreground dark:text-primary" /> :
      <ChevronDown className="w-4 h-4 text-foreground dark:text-primary" />;
  };

  const visiblePages = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

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

      <div className="relative overflow-hidden border border-border/50 dark:border-primary/15 rounded-[1.5rem] bg-surface dark:bg-gradient-to-br dark:from-surface dark:via-surface dark:to-primary/[0.09] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.25)] backdrop-blur-md">
        <span className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full pointer-events-none" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/60 dark:border-primary/20 bg-muted/[0.06] dark:bg-primary/[0.12] font-bold uppercase tracking-widest text-[10px] text-foreground">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`px-6 py-4 cursor-pointer hover:bg-muted/10 dark:hover:bg-primary/15 transition-colors group/th ${col.sortable !== false ? '' : 'cursor-default'}`}
                    onClick={() => col.sortable !== false && requestSort(col.accessor)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="transition-colors group-hover/th:text-foreground dark:group-hover/th:text-primary">
                        {col.header}
                      </span>
                      {col.sortable !== false && getSortIcon(col.accessor)}
                    </div>
                  </th>
                ))}
{(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 cursor-default text-right">Aksi</th>
              )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-primary/10 stagger-enter">
              {currentItems.map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-muted/[0.05] dark:hover:bg-primary/[0.08] transition-colors">
                  {columns.map((col, colIndex) => {
                    const cellValue = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                    return (
                      <td key={colIndex} className="px-6 py-3.5">
                        <span className={`text-[13px] ${colIndex === 0 ? 'font-bold text-foreground' : 'font-medium text-muted'}`}>
                          {cellValue === null ? '-' : (col.format ? col.format(cellValue) : cellValue)}
                        </span>
                      </td>
                    );
                  })}
{(onEdit || onDelete || onView) && (
                    <td className="px-6 py-3.5 text-right w-24">
                      <div className="flex justify-end gap-1">
                        {onView && (!viewCondition || viewCondition(row)) && (
                          <button onClick={() => onView(row)} className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Lihat Detail">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        {onEdit && (!editCondition || editCondition(row)) && (
                          <button onClick={() => onEdit(row)} className="p-1.5 text-muted hover:text-foreground dark:hover:text-primary hover:bg-muted/10 dark:hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (!deleteCondition || deleteCondition(row)) && (
                          <button onClick={() => onDelete(row._id)} className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
{processedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)} className="px-6 py-12 text-center text-muted text-xs italic">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-muted/[0.04] dark:bg-primary/[0.06] border-t border-border/40 dark:border-primary/10 gap-4">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider opacity-60">
                  Tampilkan
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-surface border border-border/60 dark:border-primary/25 rounded-lg px-2 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider opacity-60">
                  per halaman
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted opacity-60 hidden sm:inline">|</span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider opacity-60">
                {processedData.length} entri total
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-border/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 transition-all duration-300 shadow-sm disabled:cursor-not-allowed group dark:hover:border-primary dark:hover:text-primary dark:hover:bg-primary/5"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-border/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 transition-all duration-300 shadow-sm disabled:cursor-not-allowed group dark:hover:border-primary dark:hover:text-primary dark:hover:bg-primary/5"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </button>

              <div className="flex items-center gap-1 mx-1">
                {visiblePages.map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-muted opacity-40 font-black text-xs">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all duration-300 border ${
                        currentPage === p
                          ? 'bg-foreground text-background border-foreground scale-105 dark:bg-primary dark:text-white dark:border-primary dark:shadow-lg dark:shadow-primary/20'
                          : 'text-muted border-transparent hover:bg-muted/10 hover:text-foreground hover:border-border/60 dark:hover:bg-primary/5 dark:hover:text-primary dark:hover:border-primary/20'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-border/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 transition-all duration-300 shadow-sm disabled:cursor-not-allowed group dark:hover:border-primary dark:hover:text-primary dark:hover:bg-primary/5"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-border/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 transition-all duration-300 shadow-sm disabled:cursor-not-allowed group dark:hover:border-primary dark:hover:text-primary dark:hover:bg-primary/5"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;

