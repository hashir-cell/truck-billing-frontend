import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    tenant_name: '',
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

    try {
      await register(formData);
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
            <div className="logo-icon">GNS</div>
            <h1>Join GNS Billing</h1>
          </div>
          <p>Create your tenant account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="tenant_name">Company Name</label>
            <input
              id="tenant_name"
              type="text"
              placeholder="e.g. Acme Logistics"
              value={formData.tenant_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tenant_slug">Tenant Slug (URL ID)</label>
            <input
              id="tenant_slug"
              type="text"
              placeholder="e.g. acme-logistics"
              value={formData.tenant_slug}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              placeholder="Your Name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
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
            {isLoading ? 'Creating Account...' : 'Register Tenant'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
