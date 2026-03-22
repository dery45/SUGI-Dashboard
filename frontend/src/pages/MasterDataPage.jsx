import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import DataPageTemplate from '../components/common/DataPageTemplate';
import * as allData from '../data/allData';
import * as allCols from '../data/dataColumns';

export const dataRegistry = {
  'ketidakcukupan-nasional': {
    title: 'Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Nasional',
    columns: allCols.columns1,
    data: allData.dataset1,
  },
  'ketidakcukupan-provinsi': {
    title: 'Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Provinsi',
    columns: allCols.columns2,
    data: allData.dataset2,
  },
  'konsumsi-per-jenis': {
    title: 'Rata-rata Konsumsi per Jenis Pangan Penduduk Indonesia Nasional',
    columns: allCols.columns3,
    data: allData.dataset3,
  },
  'penyaluran-donasi': {
    title: 'Jumlah Pangan yang Disalurkan ke Penerima Manfaat',
    columns: allCols.columns4,
    data: allData.dataset4,
  },
  'proyeksi-neraca': {
    title: 'Proyeksi Neraca Pangan Nasional',
    columns: allCols.columns5,
    data: allData.dataset5,
  },
  'gerakan-pangan-murah': {
    title: 'Jumlah Pelaksanaan Gerakan Pangan Murah',
    columns: allCols.columns6,
    data: allData.dataset6,
  },
  'harga-konsumen-provinsi': {
    title: 'Rata-rata Harga Pangan Bulanan Tingkat Konsumen Provinsi',
    columns: allCols.columns7,
    data: allData.dataset7,
  },
  'harga-konsumen-nasional': {
    title: 'Rata-rata Harga Pangan Bulanan Tingkat Konsumen Nasional',
    columns: allCols.columns8,
    data: allData.dataset8,
  },
  'harga-produsen-nasional': {
    title: 'Rata-rata Harga Pangan Bulanan Tingkat Produsen Nasional',
    columns: allCols.columns9,
    data: allData.dataset9,
  },
  'harga-produsen-provinsi': {
    title: 'Rata-rata Harga Pangan Bulanan Tingkat Produsen Provinsi',
    columns: allCols.columns10,
    data: allData.dataset10,
  },
  'variasi-harga-produsen': {
    title: 'Koefisien Variasi Harga Pangan Tingkat Produsen Provinsi',
    columns: allCols.columns11,
    data: allData.dataset11,
  },
  'skor-pph': {
    title: 'Skor Pola Pangan Harapan Ketersediaan Nasional',
    columns: allCols.columns12,
    data: allData.dataset12,
  },
  'pangan-terselamatkan': {
    title: 'Jumlah Total Pangan yang Terselamatkan',
    columns: allCols.columns13,
    data: allData.dataset13,
  },
  'cadangan-pangan-provinsi': {
    title: 'Jumlah Cadangan Pangan Pemerintah Daerah Provinsi',
    columns: allCols.columns14,
    data: allData.dataset14,
  },
};

const MasterDataPage = () => {
  const { slug } = useParams();
  
  // Use useMemo to prevent unmounting and remounting the template on every render if slug doesn't change
  const config = useMemo(() => dataRegistry[slug], [slug]);

  if (!config) {
    return <Navigate to="/farmer" replace />;
  }

  // Use key={slug} to force react to remount the component when slug changes, safely clearing old state
  return (
    <DataPageTemplate
      key={slug}
      title={config.title}
      columns={config.columns}
      initialData={config.data}
    />
  );
};

export default MasterDataPage;
