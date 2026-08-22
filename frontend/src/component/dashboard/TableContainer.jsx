import React from 'react';
import DataTable from '../common/DataTable';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { Table2 } from 'lucide-react';

const TableContainer = ({ loading, error, onRetry, isEmpty, title, subtitle, columns, data, itemsPerPage, showSearch, emptyTitle, emptyDesc }) => {
  if (loading) return <LoadingSkeleton variant="table" count={1} />;

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (isEmpty) {
    return (
      <EmptyState
        icon={Table2}
        title={emptyTitle || 'Tidak ada data'}
        desc={emptyDesc || 'Tidak ada data yang cocok dengan filter saat ini'}
      />
    );
  }

  return (
    <DataTable
      title={title}
      subtitle={subtitle}
      columns={columns}
      data={data}
      itemsPerPage={itemsPerPage || 10}
      showSearch={showSearch !== false}
    />
  );
};

export default TableContainer;
