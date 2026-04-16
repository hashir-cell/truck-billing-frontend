import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Bot, Zap, Bell, ArrowRight, ShieldCheck, BarChart3, Clock } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav animate-fade-in-down">
        <div className="landing-logo">
          <Truck size={28} className="logo-icon" />
          <span className="logo-text">GNS Billing</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="nav-login-btn">Log in</Link>
          <Link to="/register" className="button-primary nav-cta-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        
        <div className="hero-content animate-slide-up">
          <div className="hero-badge">
            <Zap size={14} />
            <span>The Future of Logistics Billing</span>
          </div>
          <h1 className="hero-title">
            Smarter Trucking, <br />
            <span className="text-gradient">Seamless Billing.</span>
          </h1>
          <p className="hero-subtitle">
            Automate document ingestion, streamline orchestration workflows, and take complete control over your freight load lifecycles.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="button-primary hero-btn">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="button-secondary hero-btn-outline">
              Sign Into Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header animate-fade-in">
          <h2 className="section-title">Engineered for Logistics </h2>
          <p className="section-desc">Experience enterprise-grade tools designed to remove friction from load management.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card hover-lift">
            <div className="feature-icon-wrapper blue-gradient">
              <Bot size={24} className="feature-icon" />
            </div>
            <h3>AI Ingestion</h3>
            <p>Automatically extract structured data from dispatch sheets and invoices using deep-learning Document AI.</p>
          </div>

          <div className="feature-card glass-card hover-lift">
            <div className="feature-icon-wrapper purple-gradient">
              <BarChart3 size={24} className="feature-icon" />
            </div>
            <h3>Intelligent Orchestration</h3>
            <p>Assemble ready-to-invoice batches automatically based on configurable rules and delivery state milestones.</p>
          </div>

          <div className="feature-card glass-card hover-lift">
            <div className="feature-icon-wrapper green-gradient">
              <Bell size={24} className="feature-icon" />
            </div>
            <h3>Smart Notifications</h3>
            <p>Keep your fleet and customers updated seamlessly via multi-channel SMS and Email alerts.</p>
          </div>

          <div className="feature-card glass-card hover-lift">
            <div className="feature-icon-wrapper orange-gradient">
              <Clock size={24} className="feature-icon" />
            </div>
            <h3>Real-time Tracking</h3>
            <p>Log state transitions instantly, retaining a complete audit history for every load in your network.</p>
          </div>

          <div className="feature-card glass-card hover-lift">
            <div className="feature-icon-wrapper red-gradient">
              <ShieldCheck size={24} className="feature-icon" />
            </div>
            <h3>Multi-Tenant Isolation</h3>
            <p>Securely partition environments inside our infrastructure. Connect distinct Twilio and Gmail keys per tenant.</p>
          </div>

          <div className="feature-card glass-card hover-lift">
            <div className="feature-icon-wrapper cyan-gradient">
              <Truck size={24} className="feature-icon" />
            </div>
            <h3>Dispatcher Workspace</h3>
            <p>A central "Command Center" dashboard designed specifically for operations to handle exceptions actively.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Truck size={24} color="#3b82f6" />
            <span>GNS Billing</span>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} GNS Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
