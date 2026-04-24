import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns7 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const HargaKonsumenProvinsiPage = () => {
  return (
    <LiveDataPage 
      title="Rata-rata Harga Pangan Bulanan Tingkat Konsumen Provinsi"
      columns={columns7}
      endpointContext="harga-konsumen-provinsi"
      importTemplate={importTemplates.HargaKonsumenProvinsi}
    />
  );
};

export default HargaKonsumenProvinsiPage;
