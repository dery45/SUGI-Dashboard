import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns9 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const HargaProdusenNasionalPage = () => {
  return (
    <LiveDataPage 
      title="Rata-rata Harga Pangan Bulanan Tingkat Produsen Nasional"
      columns={columns9}
      endpointContext="harga-produsen-nasional"
      importTemplate={importTemplates.HargaProdusenNasional}
    />
  );
};

export default HargaProdusenNasionalPage;
