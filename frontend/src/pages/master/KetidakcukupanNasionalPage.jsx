import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns1 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const KetidakcukupanNasionalPage = () => {
  return (
    <LiveDataPage 
      title="Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Nasional"
      columns={columns1}
      endpointContext="ketidakcukupan-nasional"
      importTemplate={importTemplates.KetidakcukupanNasional}
    />
  );
};

export default KetidakcukupanNasionalPage;
