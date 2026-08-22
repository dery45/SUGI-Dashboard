import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns6 } from '@/data/dataColumns';

const GerakanPanganMurahPage = () => {
  return (
    <LiveDataPage
      title="Jumlah Pelaksanaan Gerakan Pangan Murah"
      columns={columns6}
      endpointContext="gerakan-pangan-murah"
    />
  );
};

export default GerakanPanganMurahPage;