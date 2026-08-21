import React from 'react';
import LiveDataPage from '@/component/common/LiveDataPage';
import { columns3 } from '@/data/dataColumns';

const KonsumsiPerJenisPage = () => {
  return (
    <LiveDataPage
      title="Rata-rata Konsumsi per Jenis Pangan Penduduk Indonesia Nasional"
      columns={columns3}
      endpointContext="konsumsi-per-jenis"
    />
  );
};

export default KonsumsiPerJenisPage;