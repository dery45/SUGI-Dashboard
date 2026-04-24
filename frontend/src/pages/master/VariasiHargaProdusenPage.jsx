import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns11 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const VariasiHargaProdusenPage = () => {
  return (
    <LiveDataPage 
      title="Koefisien Variasi Harga Pangan Tingkat Produsen Provinsi"
      columns={columns11}
      endpointContext="variasi-harga-produsen"
      importTemplate={importTemplates.VariasiHargaProdusen}
    />
  );
};

export default VariasiHargaProdusenPage;
