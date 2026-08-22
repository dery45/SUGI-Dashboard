import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns13 } from '@/data/dataColumns';

const PanganTerselamatkanPage = () => {
  return (
    <LiveDataPage
      title="Jumlah Total Pangan yang Terselamatkan"
      columns={columns13}
      endpointContext="pangan-terselamatkan"
    />
  );
};

export default PanganTerselamatkanPage;