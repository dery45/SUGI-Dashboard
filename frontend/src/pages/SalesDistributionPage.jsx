import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/common/DataTable';
import { Input, Select } from '../components/common/FormField';
import { required, isNumber, minValue, validateForm } from '../utils/validation';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const BUYER_LABELS = { Mill: 'Pabrik', Middleman: 'Tengkulak', Direct: 'Langsung', Government: 'Pemerintah' };

const SalesDistributionPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [farms, setFarms] = useState([]);
  const [notification, setNotification] = useState(null);
  const [saleForm, setSaleForm] = useState({ sale_date: new Date().toISOString().split('T')[0], farm_id: '', buyer_name: '', buyer_type: 'Direct', quantity_kg: '', price_per_kg: '', invoice_ref: '' });
  const [saleErrors, setSaleErrors] = useState({});
  const [expenseForm, setExpenseForm] = useState({ expense_date: new Date().toISOString().split('T')[0], farm_id: '', category: 'Bibit', amount_idr: '', description: '', receipt_ref: '' });
  const [expenseErrors, setExpenseErrors] = useState({});

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, eRes, fRes] = await Promise.all([
        fetch(`${BASE_URL}/sales`, { headers }),
        fetch(`${BASE_URL}/expenses`, { headers }),
        fetch(`${BASE_URL}/master-data/farms/all`, { headers })
      ]);
      const sJson = await sRes.json();
      const eJson = await eRes.json();
      const fJson = await fRes.json();
      if (sJson.success) setSales(sJson.data);
      if (eJson.success) setExpenses(eJson.data);
      if (fJson.success) setFarms(fJson.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const validateSale = () => {
    const { errors, hasErrors } = validateForm(saleForm, {
      farm_id: [[required, 'Farm']],
      buyer_name: [[required, 'Nama Pembeli']],
      quantity_kg: [[isNumber, 'Jumlah (Kg)'], [minValue, 0, 'Jumlah (Kg)']],
      price_per_kg: [[isNumber, 'Harga/Kg'], [minValue, 0, 'Harga/Kg']]
    });
    setSaleErrors(errors);
    return !hasErrors;
  };

  const validateExpense = () => {
    const { errors, hasErrors } = validateForm(expenseForm, {
      farm_id: [[required, 'Farm']],
      category: [[required, 'Kategori']],
      amount_idr: [[isNumber, 'Jumlah (Rp)'], [minValue, 0, 'Jumlah (Rp)']]
    });
    setExpenseErrors(errors);
    return !hasErrors;
  };

  const handleSaveSale = async () => {
    if (!validateSale()) return;
    try {
      const res = await fetch(`${BASE_URL}/sales`, { method: 'POST', headers, body: JSON.stringify(saleForm) });
      const json = await res.json();
      if (!json.success) { if (json.errors) setSaleErrors(json.errors); else alert(json.message); return; }
      showToast('Penjualan berhasil dicatat!');
      setShowSaleModal(false);
      setSaleForm({ sale_date: new Date().toISOString().split('T')[0], farm_id: '', buyer_name: '', buyer_type: 'Direct', quantity_kg: '', price_per_kg: '', invoice_ref: '' });
      setSaleErrors({});
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleSaveExpense = async () => {
    if (!validateExpense()) return;
    try {
      const res = await fetch(`${BASE_URL}/expenses`, { method: 'POST', headers, body: JSON.stringify(expenseForm) });
      const json = await res.json();
      if (!json.success) { if (json.errors) setExpenseErrors(json.errors); else alert(json.message); return; }
      showToast('Pengeluaran berhasil dicatat!');
      setShowExpenseModal(false);
      setExpenseForm({ expense_date: new Date().toISOString().split('T')[0], farm_id: '', category: 'Bibit', amount_idr: '', description: '', receipt_ref: '' });
      setExpenseErrors({});
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleDeleteSale = async (id) => {
    if (!confirm('Hapus data penjualan ini?')) return;
    await fetch(`${BASE_URL}/sales/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Hapus data pengeluaran ini?')) return;
    await fetch(`${BASE_URL}/expenses/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const totalKg = sales.reduce((s, r) => s + (r.quantity_kg || 0), 0);
  const totalRevenue = sales.reduce((s, r) => s + (r.total_revenue || r.quantity_kg * r.price_per_kg || 0), 0);
  const avgPrice = totalKg > 0 ? Math.round(totalRevenue / totalKg) : 0;
  const totalExpense = expenses.reduce((s, r) => s + (r.amount_idr || 0), 0);

  const saleColumns = [
    { header: 'Tanggal', accessor: (r) => new Date(r.sale_date).toLocaleDateString('id-ID') },
    { header: 'Farm', accessor: (r) => r.farm_id?.name || '-' },
    { header: 'Pembeli', accessor: 'buyer_name' },
    { header: 'Tipe', accessor: (r) => BUYER_LABELS[r.buyer_type] || r.buyer_type },
    { header: 'Kg', accessor: (r) => r.quantity_kg?.toLocaleString('id-ID') },
    { header: 'Harga/Kg', accessor: (r) => `Rp ${r.price_per_kg?.toLocaleString('id-ID')}` },
    { header: 'Total', accessor: (r) => `Rp ${(r.total_revenue || r.quantity_kg * r.price_per_kg || 0).toLocaleString('id-ID')}` },
    { header: 'Invoice', accessor: 'invoice_ref' }
  ];

  const expenseColumns = [
    { header: 'Tanggal', accessor: (r) => new Date(r.expense_date).toLocaleDateString('id-ID') },
    { header: 'Farm', accessor: (r) => r.farm_id?.name || '-' },
    { header: 'Kategori', accessor: 'category' },
    { header: 'Jumlah (Rp)', accessor: (r) => r.amount_idr?.toLocaleString('id-ID') },
    { header: 'Deskripsi', accessor: (r) => r.description || '-' },
    { header: 'Nota', accessor: (r) => r.receipt_ref || '-' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold">{notification}</div>
      )}

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div><h1 className="text-2xl font-black text-foreground tracking-tight">Penjualan & Distribusi</h1><p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Catat dan pantau transaksi penjualan</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setExpenseForm({ expense_date: new Date().toISOString().split('T')[0], farm_id: '', category: 'Bibit', amount_idr: '', description: '', receipt_ref: '' }); setExpenseErrors({}); setShowExpenseModal(true); }} className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-bold text-xs uppercase tracking-wider">+ Catat Pengeluaran</button>
            <button onClick={() => { setSaleForm({ sale_date: new Date().toISOString().split('T')[0], farm_id: '', buyer_name: '', buyer_type: 'Direct', quantity_kg: '', price_per_kg: '', invoice_ref: '' }); setSaleErrors({}); setShowSaleModal(true); }} className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider">+ Catat Penjualan</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, color: 'from-orange-400 to-amber-500' },
          { label: 'Total Hasil Terjual', value: `${totalKg.toLocaleString('id-ID')} kg`, color: 'from-blue-400 to-cyan-500' },
          { label: 'Harga Rata-rata/Kg', value: `Rp ${avgPrice.toLocaleString('id-ID')}`, color: 'from-green-400 to-emerald-500' }
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-6 rounded-[1.5rem] border border-border/30 shadow-lg">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.color} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-black text-foreground mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl rounded-[2.5rem] border border-border/30 shadow-lg overflow-hidden">
        <div className="flex flex-wrap border-b border-border/20">
          <button onClick={() => setActiveTab('sales')}
            className={`px-6 py-3.5 text-sm font-bold transition relative ${activeTab === 'sales' ? 'text-emerald-600' : 'text-muted hover:text-foreground'}`}>
            Penjualan
            {activeTab === 'sales' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
          <button onClick={() => setActiveTab('expenses')}
            className={`px-6 py-3.5 text-sm font-bold transition relative ${activeTab === 'expenses' ? 'text-amber-600' : 'text-muted hover:text-foreground'}`}>
            Pengeluaran
            {activeTab === 'expenses' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'sales' ? (
            <DataTable columns={saleColumns} data={sales} onDelete={(id) => handleDeleteSale(id)} itemsPerPage={10} />
          ) : (
            <DataTable columns={expenseColumns} data={expenses} onDelete={(id) => handleDeleteExpense(id)} itemsPerPage={10} />
          )}
        </div>
      </div>

      {showSaleModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowSaleModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-md bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">Catat Penjualan</h2>
            <div className="flex flex-col gap-4">
              <Select label="Farm" name="farm_id" required value={saleForm.farm_id} onChange={e => setSaleForm({ ...saleForm, farm_id: e.target.value })} error={saleErrors.farm_id}>
                <option value="">Pilih Farm</option>
                {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </Select>
              <Input label="Nama Pembeli" name="buyer_name" required value={saleForm.buyer_name} onChange={e => setSaleForm({ ...saleForm, buyer_name: e.target.value })} error={saleErrors.buyer_name} />
              <Input label="Tanggal" name="sale_date" type="date" required value={saleForm.sale_date} onChange={e => setSaleForm({ ...saleForm, sale_date: e.target.value })} />
              <Input label="Jumlah (Kg)" name="quantity_kg" type="number" required value={saleForm.quantity_kg} onChange={e => setSaleForm({ ...saleForm, quantity_kg: e.target.value })} error={saleErrors.quantity_kg} />
              <Input label="Harga/Kg" name="price_per_kg" type="number" required value={saleForm.price_per_kg} onChange={e => setSaleForm({ ...saleForm, price_per_kg: e.target.value })} error={saleErrors.price_per_kg} />
              <Input label="Invoice" name="invoice_ref" value={saleForm.invoice_ref} optional onChange={e => setSaleForm({ ...saleForm, invoice_ref: e.target.value })} />
              <Select label="Tipe Pembeli" name="buyer_type" value={saleForm.buyer_type} onChange={e => setSaleForm({ ...saleForm, buyer_type: e.target.value })}>
                {Object.entries(BUYER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSaleModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold">Batal</button>
              <button onClick={handleSaveSale} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowExpenseModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-md bg-surface border border-border/40 rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-foreground mb-6">Catat Pengeluaran</h2>
            <div className="flex flex-col gap-4">
              <Select label="Farm" name="farm_id" required value={expenseForm.farm_id} onChange={e => setExpenseForm({ ...expenseForm, farm_id: e.target.value })} error={expenseErrors.farm_id}>
                <option value="">Pilih Farm</option>
                {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </Select>
              <Input label="Tanggal" name="expense_date" type="date" required value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
              <Select label="Kategori" name="category" required value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} error={expenseErrors.category}>
                {['Bibit', 'Pupuk', 'Pestisida', 'Tenaga Kerja', 'Transportasi', 'Peralatan', 'Sewa Lahan', 'Lainnya'].map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input label="Jumlah (Rp)" name="amount_idr" type="number" required value={expenseForm.amount_idr} onChange={e => setExpenseForm({ ...expenseForm, amount_idr: e.target.value })} error={expenseErrors.amount_idr} />
              <Input label="Deskripsi" name="description" value={expenseForm.description} optional onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              <Input label="Referensi Nota" name="receipt_ref" value={expenseForm.receipt_ref} optional onChange={e => setExpenseForm({ ...expenseForm, receipt_ref: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 rounded-xl border border-border/40 text-sm font-bold">Batal</button>
              <button onClick={handleSaveExpense} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDistributionPage;
