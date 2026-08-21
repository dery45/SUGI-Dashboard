import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns14 } from '@/data/dataColumns';

const CadanganPanganProvinsiPage = () => {
  return (
    <LiveDataPage
      title="Jumlah Cadangan Pangan Pemerintah Daerah Provinsi"
      columns={columns14}
      endpointContext="cadangan-pangan-provinsi"
    />
  );
};

export default CadanganPanganProvinsiPage;