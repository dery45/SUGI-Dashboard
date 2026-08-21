import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns1 } from '@/data/dataColumns';

const KetidakcukupanNasionalPage = () => {
  return (
    <LiveDataPage
      title="Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Nasional"
      columns={columns1}
      endpointContext="ketidakcukupan-nasional"
    />
  );
};

export default KetidakcukupanNasionalPage;