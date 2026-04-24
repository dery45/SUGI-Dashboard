import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  { name: 'KetidakcukupanNasionalPage', endpoint: 'ketidakcukupan-nasional', title: 'Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Nasional', cols: 'columns1' },
  { name: 'KetidakcukupanProvinsiPage', endpoint: 'ketidakcukupan-provinsi', title: 'Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Provinsi', cols: 'columns2' },
  { name: 'KonsumsiPerJenisPage', endpoint: 'konsumsi-per-jenis', title: 'Rata-rata Konsumsi per Jenis Pangan Penduduk Indonesia Nasional', cols: 'columns3' },
  { name: 'PenyaluranDonasiPage', endpoint: 'penyaluran-donasi', title: 'Jumlah Pangan yang Disalurkan ke Penerima Manfaat', cols: 'columns4' },
  { name: 'ProyeksiNeracaPage', endpoint: 'proyeksi-neraca', title: 'Proyeksi Neraca Pangan Nasional', cols: 'columns5' },
  { name: 'GerakanPanganMurahPage', endpoint: 'gerakan-pangan-murah', title: 'Jumlah Pelaksanaan Gerakan Pangan Murah', cols: 'columns6' },
  { name: 'HargaKonsumenProvinsiPage', endpoint: 'harga-konsumen-provinsi', title: 'Rata-rata Harga Pangan Bulanan Tingkat Konsumen Provinsi', cols: 'columns7' },
  { name: 'HargaKonsumenNasionalPage', endpoint: 'harga-konsumen-nasional', title: 'Rata-rata Harga Pangan Bulanan Tingkat Konsumen Nasional', cols: 'columns8' },
  { name: 'HargaProdusenNasionalPage', endpoint: 'harga-produsen-nasional', title: 'Rata-rata Harga Pangan Bulanan Tingkat Produsen Nasional', cols: 'columns9' },
  { name: 'HargaProdusenProvinsiPage', endpoint: 'harga-produsen-provinsi', title: 'Rata-rata Harga Pangan Bulanan Tingkat Produsen Provinsi', cols: 'columns10' },
  { name: 'VariasiHargaProdusenPage', endpoint: 'variasi-harga-produsen', title: 'Koefisien Variasi Harga Pangan Tingkat Produsen Provinsi', cols: 'columns11' },
  { name: 'SkorPPHPage', endpoint: 'skor-pph', title: 'Skor Pola Pangan Harapan Ketersediaan Nasional', cols: 'columns12' },
  { name: 'PanganTerselamatkanPage', endpoint: 'pangan-terselamatkan', title: 'Jumlah Total Pangan yang Terselamatkan', cols: 'columns13' },
  { name: 'CadanganPanganProvinsiPage', endpoint: 'cadangan-pangan-provinsi', title: 'Jumlah Cadangan Pangan Pemerintah Daerah Provinsi', cols: 'columns14' }
];

const masterDir = path.join(__dirname, 'src', 'pages', 'master');
if (!fs.existsSync(masterDir)) {
  fs.mkdirSync(masterDir, { recursive: true });
}

pages.forEach(p => {
  const content = `import React from 'react';
import LiveDataPage from '../../components/common/LiveDataPage';
import { ${p.cols} } from '../../data/dataColumns';

const ${p.name} = () => {
  return (
    <LiveDataPage 
      title="${p.title}"
      columns={${p.cols}}
      endpointContext="${p.endpoint}"
    />
  );
};

export default ${p.name};
`;

  fs.writeFileSync(path.join(masterDir, `${p.name}.jsx`), content);
});

console.log('Successfully generated 14 frontend pages.');
