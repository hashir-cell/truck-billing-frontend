import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import './Auth.css'; // Keep for legacy sidebar styles if present

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-main)',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.03) 0px, transparent 50%)',
      padding: '2rem'
    }}>
      <div className="card animate-in" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '3rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.85)',
        boxShadow: 'var(--shadow-premium)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: 'var(--primary)' }}>
          <Truck size={36} strokeWidth={2.5} />
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            GNS Billing
          </h1>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '2.5rem', textAlign: 'center' }}>
          Secure access to your logistics intelligence and orchestration platform.
        </p>

        {/* Unified Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginLeft: '0.25rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  fontSize: '0.9375rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginLeft: '0.25rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  fontSize: '0.9375rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.75rem', backgroundColor: '#fef2f2', 
              color: '#ef4444', borderRadius: '0.5rem', 
              fontSize: '0.8125rem', border: '1px solid #fecaca' 
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="button-primary" 
            disabled={isLoading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Log in to Access'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an organization setup yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register tenant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
