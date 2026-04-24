import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns12 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const SkorPPHPage = () => {
  return (
    <LiveDataPage 
      title="Skor Pola Pangan Harapan Ketersediaan Nasional"
      columns={columns12}
      endpointContext="skor-pph"
      importTemplate={importTemplates.SkorPPH}
    />
  );
};

export default SkorPPHPage;
