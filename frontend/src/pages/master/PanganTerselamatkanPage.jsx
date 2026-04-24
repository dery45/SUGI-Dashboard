import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns13 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const PanganTerselamatkanPage = () => {
  return (
    <LiveDataPage 
      title="Jumlah Total Pangan yang Terselamatkan"
      columns={columns13}
      endpointContext="pangan-terselamatkan"
      importTemplate={importTemplates.PanganTerselamatkan}
    />
  );
};

export default PanganTerselamatkanPage;
