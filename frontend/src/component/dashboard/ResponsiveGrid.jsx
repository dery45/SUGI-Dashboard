import React from 'react';

const ResponsiveGrid = ({ children, cols, className }) => {
  const gridCols = cols || 2;
  const gridClass = gridCols === 1 ? 'grid-cols-1'
    : gridCols === 2 ? 'grid-cols-1 lg:grid-cols-2'
    : gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : gridCols === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 lg:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-8 ${className || ''}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
