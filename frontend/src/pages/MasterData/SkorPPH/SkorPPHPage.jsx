import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns12 } from '@/data/dataColumns';

const SkorPPHPage = () => {
  return (
    <LiveDataPage
      title="Skor Pola Pangan Harapan Ketersediaan Nasional"
      columns={columns12}
      endpointContext="skor-pph"
    />
  );
};

export default SkorPPHPage;