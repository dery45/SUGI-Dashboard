import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns6 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const GerakanPanganMurahPage = () => {
  return (
    <LiveDataPage 
      title="Jumlah Pelaksanaan Gerakan Pangan Murah"
      columns={columns6}
      endpointContext="gerakan-pangan-murah"
      importTemplate={importTemplates.GerakanPanganMurah}
    />
  );
};

export default GerakanPanganMurahPage;
