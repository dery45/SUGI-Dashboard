import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import { Input } from '../components/common/FormField';

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
      if (userData.role === 'government') navigate('/government');
      else if (userData.role === 'farmer' || userData.role === 'farmer_owner') navigate('/farmer');
      else navigate('/management');
    } catch (err) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-grid">
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
              {loading ? 'Memproses...' : 'Sign In'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
