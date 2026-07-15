const chatbotInsightRepository = require('../repositories/chatbotInsightRepository');
const chatbotAdvancedService = require('./chatbotAdvancedService');

const DAY_NAMES = ['', 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

class ChatbotInsightService {
  async getDashboardData(filters) {
    const [kpis, recsData, probsData] = await Promise.all([
      chatbotInsightRepository.getKPIs(filters),
      chatbotAdvancedService.getRecommendations().catch(() => null),
      chatbotAdvancedService.getProblems().catch(() => null),
    ]);

    const totalRekomendasi = recsData?.total ?? '—';
    const totalPermasalahan = probsData?.total ?? '—';
    const topikUnik = kpis.topikUnik ?? '—';
    const komoditasUnik = kpis.komoditasUnik ?? '—';
    const lokasiUnik = kpis.lokasiUnik ?? '—';
    const entitasUnik = kpis.entitasUnik ?? '—';

    return {
      kpis: {
        totalSesi: {
          current: kpis.totalSesi,
          label: 'Total Sesi',
          sub: 'sesi percakapan',
        },
        totalRingkasan: {
          current: kpis.totalRingkasan,
          label: 'Total Ringkasan',
          sub: 'ringkasan tersimpan',
        },
        totalKarakter: {
          current: kpis.totalKarakter,
          label: 'Total Karakter',
          sub: 'karakter',
        },
        avgPanjang: {
          current: kpis.avgPanjang,
          label: 'Rata-rata Panjang Ringkasan',
          sub: 'karakter/ringkasan',
        },
        topikUnik: {
          current: topikUnik,
          label: 'Topik Unik',
          sub: 'tipe entitas unik',
        },
        komoditasUnik: {
          current: komoditasUnik,
          label: 'Komoditas Unik',
          sub: 'komoditas terdeteksi',
        },
        lokasiUnik: {
          current: lokasiUnik,
          label: 'Lokasi Unik',
          sub: 'lokasi terdeteksi',
        },
        entitasUnik: {
          current: entitasUnik,
          label: 'Entitas Unik',
          sub: 'total entitas unik',
        },
        totalRekomendasi: {
          current: totalRekomendasi,
          label: 'Total Rekomendasi',
          sub: 'rekomendasi ditemukan',
        },
        totalPermasalahan: {
          current: totalPermasalahan,
          label: 'Total Permasalahan',
          sub: 'masalah terdeteksi',
        },
        hariPalingAktif: {
          current: kpis.hariAktif ? DAY_NAMES[kpis.hariAktif] : '—',
          label: 'Hari Paling Aktif',
          sub: 'berdasarkan jumlah sesi',
        },
        jamPalingAktif: {
          current: kpis.jamAktif !== null ? `${String(kpis.jamAktif).padStart(2, '0')}:00` : '—',
          label: 'Jam Paling Aktif',
          sub: 'berdasarkan jumlah sesi',
        },
      },
    };
  }

  async getFilterOptions() {
    return chatbotInsightRepository.getFilterOptions();
  }
}

module.exports = new ChatbotInsightService();
