import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      onLogin();
      navigate('/farmer');
    } else {
      setError('Invalid username or password');
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-4 py-2 rounded focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-4 py-2 rounded focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded transition-colors mt-2"
            >
              Sign In
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
