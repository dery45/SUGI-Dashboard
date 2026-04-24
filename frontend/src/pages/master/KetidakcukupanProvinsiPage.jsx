import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns2 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const KetidakcukupanProvinsiPage = () => {
  return (
    <LiveDataPage 
      title="Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Provinsi"
      columns={columns2}
      endpointContext="ketidakcukupan-provinsi"
      importTemplate={importTemplates.KetidakcukupanProvinsi}
    />
  );
};

export default KetidakcukupanProvinsiPage;
