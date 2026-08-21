import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns5 } from '@/data/dataColumns';

const ProyeksiNeracaPage = () => {
  return (
    <LiveDataPage
      title="Proyeksi Neraca Pangan Nasional"
      columns={columns5}
      endpointContext="proyeksi-neraca"
    />
  );
};

export default ProyeksiNeracaPage;