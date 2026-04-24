import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns8 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const HargaKonsumenNasionalPage = () => {
  return (
    <LiveDataPage 
      title="Rata-rata Harga Pangan Bulanan Tingkat Konsumen Nasional"
      columns={columns8}
      endpointContext="harga-konsumen-nasional"
      importTemplate={importTemplates.HargaKonsumenNasional}
    />
  );
};

export default HargaKonsumenNasionalPage;
