import React from 'react';

const Card = ({ title, action, info, children, className = '' }) => {
  return (
    <div className={`bg-surface border border-border/40 rounded-[2.5rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] hover:translate-y-[-4px] animate-slide-up ${className}`}>
      {(title || action || info) && (
        <div className="px-6 py-4 border-b border-border/30 flex justify-between items-center break-words gap-4 relative">
          <div className="flex-1">
            {title && <h2 className="text-sm font-black text-foreground tracking-tight uppercase tracking-wider opacity-90">{title}</h2>}
          </div>
          {(action || info) && (
            <div className="flex-shrink-0 flex items-center gap-3">
              {action && <div className="flex items-center scale-90 origin-right">{action}</div>}
              {info && (
                <div className="group relative flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-muted/20 text-muted flex items-center justify-center text-[9px] font-black cursor-help group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    ?
                  </div>
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-64 p-3 bg-surface rounded-2xl shadow-xl border border-border/30 z-50 text-[11px] font-medium text-left text-foreground animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="whitespace-pre-line leading-relaxed opacity-80">
                      {info}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
          {children}
      </div>
    </div>
  );
};

export default Card;
