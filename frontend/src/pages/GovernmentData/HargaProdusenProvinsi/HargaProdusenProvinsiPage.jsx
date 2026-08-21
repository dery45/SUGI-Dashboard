import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns10 } from '@/data/dataColumns';

const HargaProdusenProvinsiPage = () => {
  return (
    <LiveDataPage
      title="Rata-rata Harga Pangan Bulanan Tingkat Produsen Provinsi"
      columns={columns10}
      endpointContext="harga-produsen-provinsi"
    />
  );
};

export default HargaProdusenProvinsiPage;