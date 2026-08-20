import React from 'react';
import { RotateCcw } from 'lucide-react';
import DateFilter from './DateFilter';
import CommodityFilter from './CommodityFilter';
import ProvinceFilter from './ProvinceFilter';
import { useDashboardFilters } from '../../contexts/DashboardFilterContext';

const FilterBar = ({ showCommodity, showProvince, className }) => {
  const { resetFilters } = useDashboardFilters();

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className || ''}`}>
      <DateFilter />
      {showCommodity !== false && <CommodityFilter />}
      {showProvince !== false && <ProvinceFilter />}
      <button
        onClick={resetFilters}
        title="Reset filter"
        className="p-2 hover:bg-background/60 rounded-xl transition-colors text-muted hover:text-foreground"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FilterBar;
