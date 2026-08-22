import React from 'react';
import { Package } from 'lucide-react';
import { useDashboardFilters } from '../../contexts/DashboardFilterContext';

const CommodityFilter = ({ className }) => {
  const { filters, setFilter, options } = useDashboardFilters();

  if (!options.commodities.length) return null;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Package className="w-4 h-4 text-muted flex-shrink-0" />
      <select
        value={filters.commodity || 'all'}
        onChange={e => setFilter('commodity', e.target.value)}
        className="bg-background/60 border border-border/50 text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer backdrop-blur-sm min-w-[180px]"
      >
        <option value="all">Semua Komoditas</option>
        {options.commodities.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
};

export default CommodityFilter;
