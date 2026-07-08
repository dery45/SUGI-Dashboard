import React from 'react';
import { MapPin } from 'lucide-react';
import { useDashboardFilters } from '../../contexts/DashboardFilterContext';

const ProvinceFilter = ({ className }) => {
  const { filters, setFilter, options } = useDashboardFilters();

  if (!options.provinces.length) return null;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
      <select
        value={filters.province || 'all'}
        onChange={e => setFilter('province', e.target.value)}
        className="bg-background/60 border border-border/50 text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer backdrop-blur-sm min-w-[200px]"
      >
        <option value="all">Semua Provinsi</option>
        {options.provinces.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
};

export default ProvinceFilter;
