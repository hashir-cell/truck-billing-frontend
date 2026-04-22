import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck } from 'lucide-react';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    tenant_slug: '',
    full_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Derive tenant_name from slug (e.g. "acme-logistics" -> "Acme Logistics")
    const derivedName = formData.tenant_slug
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    try {
      await register({
        ...formData,
        tenant_name: derivedName
      });
      navigate('/onboarding');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">
              <Truck size={32} strokeWidth={2.5} />
            </div>
            <h1>Create Account</h1>
          </div>
          <p>Launch your fleet's command center</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              placeholder="e.g. Alex Rivera"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tenant_slug">Tenant ID (Company URL)</label>
            <input
              id="tenant_slug"
              type="text"
              placeholder="e.g. acme-logistics"
              value={formData.tenant_slug}
              onChange={handleChange}
              required
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--auth-text-muted)', marginTop: '-8px', display: 'block', paddingLeft: '4px' }}>
              Used for your secure portal link.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Preparing Environment...' : 'Start Now'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
