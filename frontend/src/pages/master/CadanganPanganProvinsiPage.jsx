import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns14 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const CadanganPanganProvinsiPage = () => {
  return (
    <LiveDataPage 
      title="Jumlah Cadangan Pangan Pemerintah Daerah Provinsi"
      columns={columns14}
      endpointContext="cadangan-pangan-provinsi"
      importTemplate={importTemplates.CadanganPanganProvinsi}
    />
  );
};

export default CadanganPanganProvinsiPage;
