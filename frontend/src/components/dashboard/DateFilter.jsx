import React from 'react';
import { Calendar } from 'lucide-react';
import { useDashboardFilters } from '../../contexts/DashboardFilterContext';

const DateFilter = ({ className }) => {
  const { filters, setFilter, options } = useDashboardFilters();

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className || ''}`}>
      <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
      <select
        value={filters.year || ''}
        onChange={e => setFilter('year', e.target.value)}
        className="bg-background/60 border border-border/50 text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer backdrop-blur-sm min-w-[100px]"
      >
        {options.years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <select
        value={filters.month || 'all'}
        onChange={e => setFilter('month', e.target.value)}
        className="bg-background/60 border border-border/50 text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer backdrop-blur-sm min-w-[120px]"
      >
        <option value="all">Semua Bulan</option>
        {options.months.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
};

export default DateFilter;
