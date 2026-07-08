import React from 'react';

const DashboardSection = ({ title, subtitle, description, accent, children, className, action }) => {
  return (
    <div className={className || ''}>
      <div className="flex items-center gap-3 mb-6 px-1">
        {accent && <div className={`w-1.5 h-6 bg-gradient-to-b ${accent} rounded-full flex-shrink-0`} />}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-foreground tracking-tight truncate">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-muted font-bold uppercase tracking-[0.2em] mt-0.5 opacity-60 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground/70 mb-6 px-1">{description}</p>
      )}
      {children}
    </div>
  );
};

export default DashboardSection;
