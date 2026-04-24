import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { columns4 } from '../../data/dataColumns';
import { importTemplates } from '../../utils/importTemplates';

const PenyaluranDonasiPage = () => {
  return (
    <LiveDataPage 
      title="Jumlah Pangan yang Disalurkan ke Penerima Manfaat"
      columns={columns4}
      endpointContext="penyaluran-donasi"
      importTemplate={importTemplates.PenyaluranDonasi}
    />
  );
};

export default PenyaluranDonasiPage;
