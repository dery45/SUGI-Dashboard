import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import PieChart from '../charts/PieChart';

const ChartDetailModal = ({ isOpen, onClose, chart }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !chart) return null;

  const renderChart = () => {
    switch (chart.chart) {
      case 'line':
        return (
          <LineChart
            data={chart.data}
            xKey={chart.xKey}
            lineKeys={chart.keys || chart.lineKeys}
            colors={chart.colors}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={chart.data}
            nameKey={chart.nameKey}
            dataKey={chart.dataKey}
            showLegend
          />
        );
      default:
        return (
          <BarChart
            data={chart.data}
            xKey={chart.xKey}
            barKeys={chart.keys || chart.barKeys}
            colors={chart.colors}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2.5rem] shadow-2xl animate-slide-up overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-8 pb-4 border-b border-border/20 min-h-[52px]">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight truncate">
              {chart.title}
            </h2>
            {chart.desc && (
              <p className="text-xs font-medium text-muted mt-1 opacity-70 hidden sm:block">
                {chart.desc}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2.5 min-w-[44px] min-h-[44px] rounded-xl border border-border/40 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 flex-shrink-0 flex items-center justify-center touch-manipulation active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-4 sm:p-8 min-h-0 overflow-y-auto">
          <div className="w-full h-[350px] sm:h-[500px]">
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDetailModal;
