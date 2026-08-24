import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DataPageTemplate from '../component/common/DataPageTemplate';
import * as allCols from '../data/dataColumns';
import { useToast } from '../contexts/ToastContext';

const INSIGHT_SOURCE_MAP = {
  // Master Data - no insights
  'farm': null,
  'block': null,
  'crop-type': null,
  'activity-type': null,

  // Government Data
  'ketidakcukupan-nasional': 'ketidakcukupannasionals',
  'ketidakcukupan-provinsi': 'ketidakcukupanprovinsis',
  'konsumsi-per-jenis': 'konsumsiperjeniss',
  'penyaluran-donasi': 'penyalurandonasis',
  'proyeksi-neraca': 'proyeksineracas',
  'gerakan-pangan-murah': 'gerakanpanganmurahs',
  'harga-konsumen-provinsi': 'hargakonsumenprovinsis',
  'harga-konsumen-nasional': 'hargakonsumennasionals',
  'harga-produsen-nasional': 'hargaprodusennasionals',
  'harga-produsen-provinsi': 'hargaprodusenprovinsis',
  'skor-pph': 'skorpphs',
  'pangan-terselamatkan': 'panganterselamatkans',
  'cadangan-pangan-provinsi': 'cadanganpanganprovinsis',
};

const slugs = [
  // Master Data (operational catalogs - 4)
  { slug: 'farm', title: 'Farm', group: 'master' },
  { slug: 'block', title: 'Block', group: 'master' },
  { slug: 'crop-type', title: 'Jenis Tanaman', group: 'master' },
  { slug: 'activity-type', title: 'Jenis Aktivitas', group: 'master' },

  // Government Data (government-facing catalogs - 13)
  { slug: 'ketidakcukupan-nasional', title: 'Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Nasional', group: 'government' },
  { slug: 'ketidakcukupan-provinsi', title: 'Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Provinsi', group: 'government' },
  { slug: 'konsumsi-per-jenis', title: 'Rata-rata Konsumsi per Jenis Pangan Penduduk Indonesia Nasional', group: 'government' },
  { slug: 'penyaluran-donasi', title: 'Jumlah Pangan yang Disalurkan ke Penerima Manfaat', group: 'government' },
  { slug: 'proyeksi-neraca', title: 'Proyeksi Neraca Pangan Nasional', group: 'government' },
  { slug: 'gerakan-pangan-murah', title: 'Jumlah Pelaksanaan Gerakan Pangan Murah', group: 'government' },
  { slug: 'harga-konsumen-provinsi', title: 'Rata-rata Harga Pangan Bulanan Tingkat Konsumen Provinsi', group: 'government' },
  { slug: 'harga-konsumen-nasional', title: 'Rata-rata Harga Pangan Bulanan Tingkat Konsumen Nasional', group: 'government' },
  { slug: 'harga-produsen-nasional', title: 'Rata-rata Harga Pangan Bulanan Tingkat Produsen Nasional', group: 'government' },
  { slug: 'harga-produsen-provinsi', title: 'Rata-rata Harga Pangan Bulanan Tingkat Produsen Provinsi', group: 'government' },
  { slug: 'skor-pph', title: 'Skor Pola Pangan Harapan Ketersediaan Nasional', group: 'government' },
  { slug: 'pangan-terselamatkan', title: 'Jumlah Total Pangan yang Terselamatkan', group: 'government' },
  { slug: 'cadangan-pangan-provinsi', title: 'Jumlah Cadangan Pangan Pemerintah Daerah Provinsi', group: 'government' },
];

const columnMap = {
  // Master Data
  'farm': allCols.columns1,  // reuse columns1 for farm (adjust as needed)
  'block': allCols.columns2,  // reuse columns2 for block
  'crop-type': allCols.columns3,  // reuse columns3 for crop-type
  'activity-type': allCols.columns4,  // reuse columns4 for activity-type

  // Government Data
  'ketidakcukupan-nasional': allCols.columns1,
  'ketidakcukupan-provinsi': allCols.columns2,
  'konsumsi-per-jenis': allCols.columns3,
  'penyaluran-donasi': allCols.columns4,
  'proyeksi-neraca': allCols.columns5,
  'gerakan-pangan-murah': allCols.columns6,
  'harga-konsumen-provinsi': allCols.columns7,
  'harga-konsumen-nasional': allCols.columns8,
  'harga-produsen-nasional': allCols.columns9,
  'harga-produsen-provinsi': allCols.columns10,
  'skor-pph': allCols.columns12,
  'pangan-terselamatkan': allCols.columns13,
  'cadangan-pangan-provinsi': allCols.columns14,
};

export const dataRegistry = Object.fromEntries(
  slugs.map(({ slug, title, group, insight }) => [
    slug,
    { title, columns: columnMap[slug], insight, group }
  ])
);

const MasterDataPage = () => {
  const { slug } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = dataRegistry[slug];
  // Master Data (farm, block, crop-type, activity-type) use /api/master-data/*
  // Government Data uses /api/master/*
  const isMasterData = config.group === 'master';
  const apiUrl = isMasterData ? `/api/master-data/${slug}` : `/api/master/${slug}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []));
    } catch (e) {
      setError(e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const normalizeKeys = (record) => {
    const norm = {};
    const accessors = config.columns.map(c => c.accessor).filter(a => typeof a === 'string');
    for (const [key, val] of Object.entries(record)) {
      const cleaned = key.trim().toLowerCase().replace(/[\s_-]+/g, '_');
      const match = accessors.find(a => a.toLowerCase() === cleaned);
      if (match) norm[match] = val;
    }
    return norm;
  };

  const handleImport = async (records) => {
    try {
      let successCount = 0;
      for (const record of records) {
        const body = normalizeKeys(record);
        const res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(body) });
        if (res.ok) successCount++;
      }
      showToast(`${successCount} data berhasil diimpor`);
      fetchData();
    } catch (e) {
      showToast('Gagal mengimpor data');
    }
  };

  const handleAdd = async (record) => {
    try {
      const res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(record) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan');
      showToast('Data berhasil ditambahkan');
      fetchData();
    } catch (e) {
      showToast(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus');
      showToast('Data berhasil dihapus');
      fetchData();
    } catch (e) {
      showToast(e.message);
    }
  };

  if (!config) {
    return <Navigate to="/farmer" replace />;
  }

  return (
    <DataPageTemplate
      key={slug}
      title={config.title}
      subtitle="Master Data Management"
      columns={config.columns}
      data={data}
      loading={loading}
      error={error}
      insightSource={INSIGHT_SOURCE_MAP[slug]}
      onRefresh={fetchData}
      onImport={handleImport}
      onAdd={handleAdd}
      onDelete={handleDelete}
    />
  );
};

export default MasterDataPage;
