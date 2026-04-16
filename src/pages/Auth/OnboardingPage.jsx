import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { uploadLogo, updateBrandingSettings, ingestDispatch } from '../../services/api';
import { 
  Building2, 
  Palette, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

const OnboardingPage = () => {
  const { selectedTenant, fetchTenants, selectedTenantId } = useApp();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Step 1 & 2 Local State
  const [brandData, setBrandData] = useState({
    company_name: '',
    primary_color: '#2563eb',
    logo_url: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Step 3 Local State
  const [dispatchFile, setDispatchFile] = useState(null);
  const [isBootstrapDone, setIsBootstrapDone] = useState(false);

  useEffect(() => {
    if (selectedTenant) {
      setBrandData(prev => ({
        ...prev,
        company_name: selectedTenant.name || prev.company_name,
        primary_color: selectedTenant.config?.branding?.primary_color || prev.primary_color,
        logo_url: selectedTenant.config?.branding?.logo_url || prev.logo_url
      }));
      setLogoPreview(selectedTenant.config?.branding?.logo_url || null);
    }
  }, [selectedTenant]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSaveBranding = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (logoFile) {
        const { logo_url } = await uploadLogo(logoFile);
        brandData.logo_url = logo_url;
      }
      
      await updateBrandingSettings({
        primary_color: brandData.primary_color,
        company_name: brandData.company_name,
        onboarding_completed: false // still in progress
      });
      
      await fetchTenants();
      nextStep();
    } catch (err) {
      setError('Failed to save branding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrap = async () => {
    if (!dispatchFile) {
        nextStep();
        return;
    }
    setIsLoading(true);
    try {
      await ingestDispatch(dispatchFile);
      setIsBootstrapDone(true);
      nextStep();
    } catch (err) {
      setError('Failed to process data file. You can skip this step.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await updateBrandingSettings({
        primary_color: brandData.primary_color,
        company_name: brandData.company_name,
        onboarding_completed: true
      });
      await fetchTenants();
      navigate('/dashboard');
    } catch (err) {
        navigate('/dashboard'); // Proceed anyway
    }
  };

  const ProgressBar = () => (
    <div className="onboarding-stepper">
      {[1, 2, 3, 4].map(s => (
        <React.Fragment key={s}>
          <div className={`step-node ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
            {step > s ? <CheckCircle2 size={16} /> : s}
          </div>
          {s < 4 && <div className={`step-line ${step > s ? 'active' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="onboarding-layout">
      <div className="onboarding-card">
        <ProgressBar />
        
        {error && <div className="error-banner">{error}</div>}

        <div className="onboarding-content">
          {step === 1 && (
            <div className="fade-in">
              <div className="step-header">
                <div className="step-icon"><Building2 size={32} /></div>
                <h1>Welcome to GNS Billing</h1>
                <p>Let's start by confirming your organization details.</p>
              </div>
              <div className="form-group-large">
                <label>Company Name</label>
                <input 
                  type="text" 
                  value={brandData.company_name}
                  onChange={(e) => setBrandData({...brandData, company_name: e.target.value})}
                  placeholder="e.g. Acme Global Logistics"
                />
              </div>
              <div className="onboarding-actions">
                <button 
                  className="btn-onboarding-primary" 
                  onClick={nextStep}
                  disabled={!brandData.company_name}
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="step-header">
                <div className="step-icon"><Palette size={32} /></div>
                <h1>Brand Identity</h1>
                <p>Customize the platform to match your corporate style.</p>
              </div>
              
              <div className="branding-grid">
                <div className="logo-upload-container">
                    <label>Company Logo</label>
                    <div className="logo-preview-box">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" />
                        ) : (
                            <Camera size={40} opacity={0.3} />
                        )}
                        <input type="file" onChange={handleLogoChange} accept="image/*" />
                        <div className="upload-overlay">
                            <Upload size={18} /><span>Change Logo</span>
                        </div>
                    </div>
                </div>

                <div className="color-picker-container">
                    <label>Brand Primary Color</label>
                    <div className="color-options">
                        {['#2563eb', '#7c3aed', '#db2777', '#f59e0b', '#10b981', '#1e293b'].map(c => (
                            <button 
                                key={c}
                                className={`color-swatch ${brandData.primary_color === c ? 'selected' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setBrandData({...brandData, primary_color: c})}
                            />
                        ))}
                    </div>
                    <div className="custom-color">
                        <input 
                            type="color" 
                            value={brandData.primary_color}
                            onChange={(e) => setBrandData({...brandData, primary_color: e.target.value})}
                        />
                        <span>Custom HEX Code</span>
                    </div>
                </div>
              </div>

              <div className="onboarding-actions">
                <button className="btn-onboarding-secondary" onClick={prevStep}>
                  <ChevronLeft size={18} /> Back
                </button>
                <button className="btn-onboarding-primary" onClick={handleSaveBranding} disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save & Continue'} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <div className="step-header">
                <div className="step-icon"><Layers size={32} /></div>
                <h1>Bootstrap Your Data</h1>
                <p>Upload a PCS Dispatch file to seed your dashboard immediately.</p>
              </div>

              <div className={`file-dropzone ${dispatchFile ? 'has-file' : ''}`}>
                <input type="file" onChange={(e) => setDispatchFile(e.target.files[0])} accept=".csv,.xlsx" />
                <div className="dropzone-info">
                   <Upload size={48} />
                   <h3>{dispatchFile ? dispatchFile.name : 'Select or Drop Dispatch File'}</h3>
                   <p>CSV or XLSX supported</p>
                </div>
              </div>

              <div className="onboarding-actions">
                <button className="btn-onboarding-secondary" onClick={prevStep}>
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  className={dispatchFile ? "btn-onboarding-primary" : "btn-onboarding-secondary"} 
                  onClick={handleBootstrap} 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (dispatchFile ? 'Process File' : 'Skip & Finish')} 
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="fade-in success-step">
              <div className="sparkle-container">
                <Sparkles size={80} className="floating-icon" />
              </div>
              <h1>You're All Set!</h1>
              <p>Your workspace for <strong>{brandData.company_name}</strong> is ready and configured.</p>
              
              <div className="launch-preview">
                 <div className="preview-top" style={{ backgroundColor: brandData.primary_color }} />
                 <div className="preview-avatar">
                   {logoPreview ? <img src={logoPreview} alt="Logo" /> : <Building2 size={24} />}
                 </div>
              </div>

              <button className="btn-onboarding-launch" onClick={handleFinish} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Launch Organization Dashboard'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .onboarding-layout {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }
        .onboarding-card {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          padding: 3rem;
          position: relative;
        }
        .onboarding-stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3rem;
          gap: 0.5rem;
        }
        .step-node {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          transition: all 0.3s;
          background: white;
        }
        .step-node.active {
          border-color: var(--primary, #2563eb);
          color: var(--primary, #2563eb);
          box-shadow: 0 0 0 4px #eff6ff;
        }
        .step-node.completed {
          background: var(--primary, #2563eb);
          border-color: var(--primary, #2563eb);
          color: white;
        }
        .step-line {
          height: 2px;
          width: 40px;
          background: #e2e8f0;
          transition: all 0.3s;
        }
        .step-line.active {
          background: var(--primary, #2563eb);
        }
        .step-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .step-icon {
          width: 64px;
          height: 64px;
          border-radius: 1rem;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .step-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .step-header p {
          color: #64748b;
        }
        .form-group-large label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #334155;
        }
        .form-group-large input {
          width: 100%;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s;
        }
        .form-group-large input:focus {
          border-color: var(--primary, #2563eb);
          box-shadow: 0 0 0 3px #eff6ff;
        }
        .branding-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        .logo-preview-box {
          height: 120px;
          border: 2px dashed #e2e8f0;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #f8fafc;
          cursor: pointer;
        }
        .logo-preview-box img {
          max-height: 80%;
          max-width: 80%;
          object-fit: contain;
        }
        .logo-preview-box input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .upload-overlay {
          position: absolute;
          bottom: 0; inset: 0;
          background: rgba(0,0,0,0.4);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .logo-preview-box:hover .upload-overlay {
          opacity: 1;
        }
        .color-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin: 0.75rem 0;
        }
        .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 1px #e2e8f0;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .color-swatch.selected {
          transform: scale(1.2);
          box-shadow: 0 0 0 2px var(--primary, #2563eb);
        }
        .custom-color {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #64748b;
        }
        .custom-color input {
          width: 24px;
          height: 24px;
          padding: 0; border: none;
          background: none; cursor: pointer;
        }
        .file-dropzone {
          border: 2px dashed #e2e8f0;
          border-radius: 1.5rem;
          padding: 3rem;
          text-align: center;
          position: relative;
          background: #f8fafc;
          transition: all 0.3s;
        }
        .file-dropzone.has-file {
          border-color: #10b981;
          background: #f0fdf4;
        }
        .file-dropzone input {
          position: absolute; inset: 0; opacity: 0; cursor: pointer;
        }
        .dropzone-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #64748b;
        }
        .file-dropzone.has-file .dropzone-info {
          color: #059669;
        }
        .onboarding-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 3rem;
        }
        .btn-onboarding-primary {
          background: var(--primary, #2563eb);
          color: white;
          border: none;
          padding: 0.875rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-onboarding-secondary {
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 0.875rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .success-step {
          text-align: center;
        }
        .floating-icon {
          color: #f59e0b;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .launch-preview {
          width: 200px;
          height: 140px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          margin: 2rem auto;
          overflow: hidden;
          position: relative;
        }
        .preview-top { height: 30px; }
        .preview-avatar {
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          border: 3px solid white;
          position: absolute;
          top: 15px; left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .preview-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .btn-onboarding-launch {
          width: 100%;
          background: #1e293b;
          color: white;
          border: none;
          padding: 1.25rem;
          border-radius: 1rem;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
          transition: transform 0.2s;
        }
        .btn-onboarding-launch:hover { transform: translateY(-2px); }
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default OnboardingPage;
