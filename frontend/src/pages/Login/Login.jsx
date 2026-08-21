import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { homePathFor } from '@/services/ProtectedRoutes';
import Card from '@/component/common/Card';
import { Input } from '@/component/common/FormField';
import heroImage from '@/assets/hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Format email tidak valid';
    if (!password) e.password = 'Password wajib diisi';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const userData = await login(email, password);
      navigate(homePathFor(userData.role));
    } catch (err) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">SUGI<span className="text-white">Dash</span></h1>
            <p className="text-white/80 text-lg font-medium">Food Security Intelligence System</p>
          </div>
          <div className="text-center text-white/70 text-sm">
            <p>Analisis Ketahanan Pangan Nasional</p>
            <p className="mt-1">Monitoring, Analisis, & Keputusan Berbasis Data</p>
          </div>
        </div>
      </div>

      {/* Login form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-grid bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">SUGI<span className="text-foreground">Dash</span></h1>
            <p className="text-muted mt-2">Food Security Intelligence System</p>
          </div>
          <Card>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                error={fieldErrors.email}
                placeholder="Masukkan email"
                autoFocus
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }}
                error={fieldErrors.password}
                placeholder="Masukkan password"
              />
              {error && <p className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 mt-2 text-sm uppercase tracking-wider"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;