import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns4 } from '@/data/dataColumns';

const PenyaluranDonasiPage = () => {
  return (
    <LiveDataPage
      title="Jumlah Pangan yang Disalurkan ke Penerima Manfaat"
      columns={columns4}
      endpointContext="penyaluran-donasi"
    />
  );
};

export default PenyaluranDonasiPage;