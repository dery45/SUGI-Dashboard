import React, { useState } from 'react';
import { Info } from 'lucide-react';

const KpiCard = ({ label, value, sub, detail, tooltip, icon: Icon, gradient, iconColor }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} backdrop-blur-xl p-7 rounded-3xl border shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl`}
      tabIndex={0}
      aria-label={`${label}: ${value}${sub ? ` ${sub}` : ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.25em]">{label}</p>
          {tooltip && (
            <div className="relative inline-flex">
              <button
                type="button"
                className="text-muted/40 hover:text-muted transition-colors focus:outline-none"
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                onFocus={() => setShowTip(true)}
                onBlur={() => setShowTip(false)}
                aria-label={`Info: ${tooltip}`}
                tabIndex={0}
              >
                <Info className="w-3 h-3" />
              </button>
              {showTip && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface/95 backdrop-blur-md border border-border/60 rounded-xl shadow-xl text-[11px] font-medium text-muted-foreground whitespace-nowrap z-50 pointer-events-none"
                  role="tooltip"
                >
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-surface/95 border-r border-b border-border/60 rotate-45 -mt-1" />
                </div>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-white/5 backdrop-blur-sm ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tighter text-foreground">{value}</span>
        {sub && <span className="text-sm font-bold text-muted/60">{sub}</span>}
      </div>
      {detail && <p className="text-[11px] text-muted/50 font-medium mt-2">{detail}</p>}
    </div>
  );
};

export default KpiCard;
