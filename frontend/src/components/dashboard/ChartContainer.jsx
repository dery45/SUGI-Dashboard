import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { BarChart3 } from 'lucide-react';

const ChartContainer = ({ loading, error, onRetry, isEmpty, emptyTitle, emptyDesc, children, height, className }) => {
  if (loading) {
    return (
      <div className={className}>
        <LoadingSkeleton variant="chart" count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={className}>
        <EmptyState
          icon={BarChart3}
          title={emptyTitle || 'Tidak ada data'}
          desc={emptyDesc || 'Tidak ada data yang cocok dengan filter saat ini'}
        />
      </div>
    );
  }

  return (
    <div className={className} style={height ? { height } : undefined}>
      {children}
    </div>
  );
};

export default ChartContainer;
