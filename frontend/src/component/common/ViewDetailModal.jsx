import React from 'react';
import { X } from 'lucide-react';

const ViewDetailModal = ({ isOpen, onClose, record, columns, title = 'Detail Data' }) => {
  if (!isOpen || !record) return null;

  const getDisplayValue = (row, accessor) => {
    if (typeof accessor === 'function') {
      const result = accessor(row);
      // If the function returns a React element (JSX), return it directly for rendering
      if (React.isValidElement(result)) return result;
      // Otherwise return the primitive value
      return result;
    }
    const value = row[accessor];
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      // Handle common nested object patterns
      if (value.name) return value.name;
      if (value.label) return value.label;
      if (value.title) return value.title;
      if (value.value) return value.value;
      // For color objects with backgroundColor style
      if (value.backgroundColor) return value.backgroundColor;
      // For objects with background color in style
      if (value.style?.backgroundColor) return value.style.backgroundColor;
      // Fallback: try to find any string property
      const stringProps = Object.values(value).filter(v => typeof v === 'string');
      if (stringProps.length > 0) return stringProps.join(', ');
      return JSON.stringify(value);
    }
    return value;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div className="relative w-full sm:max-w-lg bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border/40 hover:border-primary transition-all" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {columns.map((col, index) => {
            if (col.accessor === '_id' || col.accessor === 'no' || col.header === 'No') return null;
            const value = getDisplayValue(record, col.accessor);
            const isReactElement = React.isValidElement(value);
            return (
              <div key={index} className="flex flex-col gap-1.5 p-3 bg-background/30 border border-border/40 rounded-xl">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  {col.header}
                </label>
                <span className="text-sm font-medium text-foreground break-all">
                  {isReactElement ? (
                    value
                  ) : typeof value === 'object' && value !== null ? (
                    <span className="italic text-muted">{JSON.stringify(value)}</span>
                  ) : (
                    value
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewDetailModal;