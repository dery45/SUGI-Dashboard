import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns10 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const HargaProdusenProvinsiPage = () => {
  return (
    <LiveDataPage 
      title="Rata-rata Harga Pangan Bulanan Tingkat Produsen Provinsi"
      columns={columns10}
      endpointContext="harga-produsen-provinsi"
      importTemplate={importTemplates.HargaProdusenProvinsi}
    />
  );
};

export default HargaProdusenProvinsiPage;
