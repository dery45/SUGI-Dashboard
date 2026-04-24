import React, { useState, useEffect } from 'react';
import RecordSaleModal from '../components/management/RecordSaleModal';
import RecordExpenseModal from '../components/management/RecordExpenseModal';
import { useGenericResource } from '../hooks/useGenericResource';

const BUYER_COLORS = { Mill: 'bg-blue-100 text-blue-700', Middleman: 'bg-orange-100 text-orange-700', Direct: 'bg-green-100 text-green-700', Government: 'bg-purple-100 text-purple-700' };
const BUYER_LABELS = { Mill: 'Pabrik', Middleman: 'Tengkulak', Direct: 'Langsung', Government: 'Pemerintah' };

const SalesDistributionPage = () => {
  const { data: sales, loading: salesLoading, fetchData: fetchSales, createData: createSale, deleteData: deleteSale } = useGenericResource('sales');
  const { createData: createExpense } = useGenericResource('expenses');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleSaveSale = async (data) => {
    const newSale = {
      sale_date: data.sale_date,
      farm_id: '661faecfc11c4c1a2b000111', // Dummy ID if not provided mapped by backend
      crop_cycle_id: '661faecfc11c4c1a2b000222', // Dummy ID
      buyer_name: data.buyer_name,
      buyer_type: data.buyer_type,
      quantity_kg: parseFloat(data.quantity_kg),
      price_per_kg: parseFloat(data.price_per_kg),
      invoice_ref: data.invoice_ref || '-',
    };
    await createSale(newSale);
    showToast('Penjualan berhasil dicatat!');
    setIsSaleModalOpen(false);
  };

  const handleSaveExpense = async (data) => {
    const newExpense = {
       farm_id: '661faecfc11c4c1a2b000111',
       crop_cycle_id: '661faecfc11c4c1a2b000222',
       category: data.category,
       amount_idr: parseFloat(data.amount_idr),
       description: data.description,
       expense_date: data.expense_date,
       receipt_ref: data.receipt_ref
    };
    await createExpense(newExpense);
    showToast(`Pengeluaran Rp ${Number(data.amount_idr).toLocaleString('id-ID')} dicatat.`);
    setIsExpenseModalOpen(false);
  };

  const safeSales = Array.isArray(sales) ? sales : [];
  const totalKg = safeSales.reduce((s, r) => s + (r.quantity_kg || 0), 0);
  const totalRevenue = safeSales.reduce((s, r) => s + (r.total_revenue || 0), 0);
  const avgPrice = totalKg > 0 ? Math.round(totalRevenue / totalKg) : 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium">
          ✓ {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Penjualan & Distribusi</h1>
          <p className="text-gray-500 text-sm">Catat dan pantau seluruh transaksi penjualan hasil panen</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsExpenseModalOpen(true)} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 text-sm shadow-sm">
            + Catat Pengeluaran
          </button>
          <button onClick={() => setIsSaleModalOpen(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-sm shadow-sm">
            + Catat Penjualan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 rounded-xl shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Pendapatan</p>
          <p className="text-2xl font-black mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-70 mt-1">{sales.length} transaksi</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-5 rounded-xl shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Hasil Terjual</p>
          <p className="text-2xl font-black mt-1">{totalKg.toLocaleString('id-ID')} kg</p>
          <p className="text-xs opacity-70 mt-1">dari {sales.length} transaksi</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-xl shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Harga Rata-rata/Kg</p>
          <p className="text-2xl font-black mt-1">Rp {avgPrice.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-70 mt-1">rata-rata dari semua penjualan</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">📋 Riwayat Penjualan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">Farm</th>
                <th className="px-6 py-3 text-left">Pembeli</th>
                <th className="px-6 py-3 text-left">Tipe</th>
                <th className="px-6 py-3 text-right">Jumlah (Kg)</th>
                <th className="px-6 py-3 text-right">Harga/Kg</th>
                <th className="px-6 py-3 text-right">Total Rp</th>
                <th className="px-6 py-3 text-left">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salesLoading && <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500 italic">Memuat penjualan...</td></tr>}
              {!salesLoading && safeSales.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-400 italic">Belum ada data penjualan.</td></tr>
              )}
              {!salesLoading && safeSales.map(sale => (
                <tr key={sale._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">{new Date(sale.sale_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{sale.farm_id?.name || 'Blok A'}</td>
                  <td className="px-6 py-4 text-gray-600">{sale.buyer_name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BUYER_COLORS[sale.buyer_type] || 'bg-gray-100 text-gray-600'}`}>
                      {BUYER_LABELS[sale.buyer_type] || sale.buyer_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 font-medium">{sale.quantity_kg?.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right text-gray-600">Rp {sale.price_per_kg?.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">Rp {sale.total_revenue?.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs font-mono">{sale.invoice_ref}</td>
                  <td className="px-6 py-4"><button onClick={() => deleteSale(sale._id)} className="text-red-500 text-xs font-bold hover:text-red-700">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RecordSaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} onSave={handleSaveSale} />
      <RecordExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} />
    </div>
  );
};

export default SalesDistributionPage;
