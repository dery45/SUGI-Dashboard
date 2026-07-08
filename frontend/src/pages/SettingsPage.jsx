import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import { Input, Select } from '../components/common/FormField';
import { required, isEmail, isPhone, minLength, validateForm } from '../utils/validation';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const SettingsPage = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' });
  const [profileErrors, setProfileErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordErrors, setPasswordErrors] = useState({});

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, farmsRes] = await Promise.all([
        fetch(`${BASE_URL}/settings/profile`, { headers }),
        user?.role === 'farmer_owner' ? fetch(`${BASE_URL}/master-data/farms/all`, { headers }) : Promise.resolve(null)
      ]);
      const profJson = await profRes.json();
      if (profJson.success) {
        setProfile(profJson.data);
        setProfileForm({ name: profJson.data.name || '', phone: profJson.data.phone || '', address: profJson.data.address || '' });
      }
      if (farmsRes) {
        const farmsJson = await farmsRes.json();
        if (farmsJson.success) setFarms(farmsJson.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, user?.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveProfile = async () => {
    const { errors, hasErrors } = validateForm(profileForm, {
      name: [[required, 'Nama']],
      phone: [[isPhone, 'Telepon']]
    });
    setProfileErrors(errors);
    if (hasErrors) return;

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/settings/profile`, {
        method: 'PUT', headers, body: JSON.stringify(profileForm)
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        showToast('Profil berhasil diperbarui');
      } else {
        showToast(json.message || 'Gagal memperbarui profil', 'error');
      }
    } catch (e) { showToast('Gagal menyimpan', 'error'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    const { errors, hasErrors } = validateForm(passwordForm, {
      current_password: [[required, 'Password saat ini']],
      new_password: [[required, 'Password baru'], [minLength, 6, 'Password baru']],
      confirm_password: [[required, 'Konfirmasi password']]
    });
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Konfirmasi password tidak cocok';
    }
    setPasswordErrors(errors);
    if (hasErrors || errors.confirm_password) return;

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/settings/change-password`, {
        method: 'PUT', headers, body: JSON.stringify(passwordForm)
      });
      const json = await res.json();
      if (json.success) {
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        showToast('Password berhasil diubah');
      } else {
        setPasswordErrors(json.errors || {});
        showToast(json.message || 'Gagal mengubah password', 'error');
      }
    } catch (e) { showToast('Gagal mengubah password', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-lg text-sm font-bold ${notification.type === 'error' ? 'bg-destructive text-white' : 'bg-primary text-white'}`}>
          {notification.msg}
        </div>
      )}

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Pengaturan</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola profil dan keamanan akun</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface/50 border border-border/30 rounded-xl p-1">
        {[
          { id: 'profile', label: 'Profil' },
          { id: 'security', label: 'Keamanan' },
          ...(user?.role === 'farmer_owner' || user?.role === 'superadmin' ? [{ id: 'farms', label: 'Farm Saya' }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Informasi Profil">
          <div className="flex flex-col gap-5 max-w-lg">
            <Input label="Nama" name="name" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} error={profileErrors.name} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Email <span className="text-muted/50 font-normal normal-case">(Tidak dapat diubah)</span>
              </label>
              <input value={profile?.email || ''} disabled className="w-full px-3 py-2 bg-background/30 border border-border/30 rounded-xl text-sm text-muted cursor-not-allowed" />
            </div>
            <Input label="Telepon" name="phone" optional value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} error={profileErrors.phone} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Alamat <span className="text-muted/50 font-normal normal-case">(Optional)</span></label>
              <textarea value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Peran</label>
              <input value={profile?.role || '-'} disabled className="w-full px-3 py-2 bg-background/30 border border-border/30 rounded-xl text-sm text-muted cursor-not-allowed" />
            </div>
            <div className="pt-2">
              <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card title="Ubah Password">
          <div className="flex flex-col gap-5 max-w-lg">
            <Input label="Password Saat Ini" name="current_password" type="password" required value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} error={passwordErrors.current_password} />
            <Input label="Password Baru" name="new_password" type="password" required value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} error={passwordErrors.new_password} />
            <Input label="Konfirmasi Password Baru" name="confirm_password" type="password" required value={passwordForm.confirm_password} onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} error={passwordErrors.confirm_password} />
            <div className="pt-2">
              <button onClick={handleChangePassword} disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Ubah Password'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Farms Tab (farmer_owner only) */}
      {activeTab === 'farms' && (
        <Card title="Farm yang Ditugaskan">
          <p className="text-xs text-muted mb-4">Farm yang Anda miliki akses untuk mengelolanya.</p>
          {farms.length === 0 ? (
            <p className="text-sm text-muted/50 italic">Belum ada farm yang ditugaskan.</p>
          ) : (
            <div className="grid gap-3">
              {farms.map(farm => (
                <div key={farm._id} className="flex items-center justify-between p-4 bg-background/30 border border-border/30 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-foreground">{farm.name}</p>
                    <p className="text-[11px] text-muted">{farm.code} — {farm.province || '-'} — {farm.total_area_ha || 0} Ha</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${farm.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{farm.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
