import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns9 } from '@/data/dataColumns';

const HargaProdusenNasionalPage = () => {
  return (
    <LiveDataPage
      title="Rata-rata Harga Pangan Bulanan Tingkat Produsen Nasional"
      columns={columns9}
      endpointContext="harga-produsen-nasional"
    />
  );
};

export default HargaProdusenNasionalPage;