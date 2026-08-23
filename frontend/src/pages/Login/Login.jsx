import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { homePathFor } from '@/services/ProtectedRoutes';

const LOGO_URL = '/images/sugi-logo.png';
const BG_URL = '/images/background.jpg';

const inputCls =
  'w-full px-4 py-3 bg-background/50 border border-border/60 rounded-2xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all disabled:opacity-50';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (userData.role === 'farmer') {
        // Petani: land on their actual first accessible stage (assignment-driven)
        const { resolveFarmerLanding } = await import('@/services/farmerLanding');
        navigate(await resolveFarmerLanding(localStorage.getItem('token')));
      } else {
        navigate(homePathFor(userData.role));
      }
    } catch (err) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Branded panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_URL})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-emerald-800/70" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: '-3s' }}
        />

        <div className="relative z-10 text-center px-16">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl p-3">
            <img src={LOGO_URL} alt="SUGI" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            SUGI<span className="text-primary">Dash</span>
          </h1>
          <p className="text-white/85 text-lg font-medium">Sistem Manajemen Pertanian Terpadu</p>
          <p className="text-white/55 text-sm mt-2 max-w-md mx-auto">
            Kelola kebun, siklus tanam, panen, hingga penjualan hasil dalam satu platform
          </p>

          <div className="mt-10 flex gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>

      {/* ── Login form panel ── */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-surface border border-border/60 shadow-lg rounded-[1rem] flex items-center justify-center p-1.5">
              <img src={LOGO_URL} alt="SUGI" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black text-foreground tracking-tight">SUGIDash</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Selamat Datang</h2>
            <p className="text-muted mt-2 font-medium">Silakan masuk untuk melanjutkan</p>
          </div>

          <div className="bg-white/80 dark:bg-surface/80 backdrop-blur-3xl border border-border/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/30">
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50/80 dark:bg-red-500/10 backdrop-blur-sm border border-red-200/60 dark:border-red-500/20 text-red-700 dark:text-red-400 px-5 py-4 rounded-[1.5rem] text-sm font-semibold flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="login-email" className="text-xs font-bold text-muted uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  error={fieldErrors.email}
                  placeholder="Masukkan email"
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={loading}
                  className={inputCls}
                />
                {fieldErrors.email && <p className="text-destructive text-xs font-semibold">{fieldErrors.email}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="login-password" className="text-xs font-bold text-muted uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Masukkan password"
                    disabled={loading}
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-destructive text-xs font-semibold">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-black py-3.5 px-4 rounded-2xl transition-all disabled:opacity-50 mt-1 text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <p className="text-center text-xs font-medium text-muted/70 mt-8">&copy; 2026 SUGIDash. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
