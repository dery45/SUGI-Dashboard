import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns3 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const KonsumsiPerJenisPage = () => {
  return (
    <LiveDataPage 
      title="Rata-rata Konsumsi per Jenis Pangan Penduduk Indonesia Nasional"
      columns={columns3}
      endpointContext="konsumsi-per-jenis"
      importTemplate={importTemplates.KonsumsiPerJenis}
    />
  );
};

export default KonsumsiPerJenisPage;
