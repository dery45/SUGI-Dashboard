import React from 'react';
import { Info } from 'lucide-react';

const ChartCard = ({ title, info, action, children, className, onClick, id, color, icon: ChartIcon, desc }) => {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30 shadow-lg transition-all duration-300 hover:shadow-xl ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : ''} ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {ChartIcon && color && (
            <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
              <ChartIcon className="w-3.5 h-3.5" style={{ color }} />
            </div>
          )}
          <h3 className="text-sm font-bold text-foreground truncate">{title}</h3>
          {info && (
            <div className="relative group flex-shrink-0">
              <Info className="w-3.5 h-3.5 text-muted/40 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl max-w-[260px]">
                {info}
              </div>
            </div>
          )}
          {desc && (
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider opacity-60 hidden sm:block truncate">
              {desc}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {action}
          {onClick && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Perbesar &rarr;
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default ChartCard;
