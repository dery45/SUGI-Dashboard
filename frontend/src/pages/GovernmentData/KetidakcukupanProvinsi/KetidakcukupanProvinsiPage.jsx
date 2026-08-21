import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns2 } from '@/data/dataColumns';

const KetidakcukupanProvinsiPage = () => {
  return (
    <LiveDataPage
      title="Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Provinsi"
      columns={columns2}
      endpointContext="ketidakcukupan-provinsi"
    />
  );
};

export default KetidakcukupanProvinsiPage;