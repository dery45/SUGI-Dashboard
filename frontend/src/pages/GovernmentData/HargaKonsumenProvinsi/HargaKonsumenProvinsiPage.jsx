import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns7 } from '@/data/dataColumns';

const HargaKonsumenProvinsiPage = () => {
  return (
    <LiveDataPage
      title="Rata-rata Harga Pangan Bulanan Tingkat Konsumen Provinsi"
      columns={columns7}
      endpointContext="harga-konsumen-provinsi"
    />
  );
};

export default HargaKonsumenProvinsiPage;