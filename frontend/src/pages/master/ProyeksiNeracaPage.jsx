import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns5 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const ProyeksiNeracaPage = () => {
  return (
    <LiveDataPage 
      title="Proyeksi Neraca Pangan Nasional"
      columns={columns5}
      endpointContext="proyeksi-neraca"
      importTemplate={importTemplates.ProyeksiNeraca}
    />
  );
};

export default ProyeksiNeracaPage;
