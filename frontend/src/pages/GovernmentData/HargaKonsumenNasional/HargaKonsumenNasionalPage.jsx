import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns8 } from '@/data/dataColumns';

const HargaKonsumenNasionalPage = () => {
  return (
    <LiveDataPage
      title="Rata-rata Harga Pangan Bulanan Tingkat Konsumen Nasional"
      columns={columns8}
      endpointContext="harga-konsumen-nasional"
    />
  );
};

export default HargaKonsumenNasionalPage;