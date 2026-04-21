import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Clock, Save, LogOut } from 'lucide-react';

const PharmacyProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user-role');
    navigate('/login');
  };
  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header">
        <h2>Pharmacy Profile</h2>
        <p>Manage your public business information and location.</p>
      </div>

      <div className="profile-content-grid">
        <div className="profile-form glassmorphism">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="input-group">
              <label><User size={14} /> Pharmacy Name</label>
              <input type="text" defaultValue="Apollo Pharmacy Central" className="glass-input" />
            </div>
            <div className="input-group">
              <label><Mail size={14} /> Contact Email</label>
              <input type="email" defaultValue="pharmacy@rakshasetu.in" className="glass-input" />
            </div>
            <div className="input-group">
              <label><Phone size={14} /> Business Phone</label>
              <input type="tel" defaultValue="011-23456789" className="glass-input" />
            </div>
          </div>

          <div className="form-section">
            <h3>Location & Hours</h3>
            <div className="input-group">
              <label><MapPin size={14} /> Full Address</label>
              <textarea defaultValue="Connaught Place, New Delhi" className="glass-input" rows="3" />
            </div>
            <div className="input-group">
              <label><Clock size={14} /> Operating Hours</label>
              <input type="text" defaultValue="09:00 AM - 11:00 PM" className="glass-input" />
            </div>
          </div>

          <button className="primary-btn-wide" style={{ marginTop: '1rem' }}>
            <Save size={18} /> Update Profile
          </button>
          
          <button 
            className="primary-btn-wide logout-mobile-safe" 
            style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Secure Sign Out
          </button>
        </div>

        <div className="profile-preview glassmorphism">
          <h3>Public Preview</h3>
          <p className="preview-note">This is how users see your pharmacy in search results.</p>
          
          <div className="mock-search-result">
            <div className="mock-pharma-name">Apollo Pharmacy Central</div>
            <div className="mock-dist">0.8 km away</div>
            <div className="mock-status available">Stock: Available</div>
            <div className="mock-address">Connaught Place, Delhi</div>
            <button className="mock-call-btn">Call Pharmacy</button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-container { display: flex; flex-direction: column; gap: 2rem; }
        .profile-header h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }
        .profile-header p { color: var(--text-muted); }
        .profile-content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
        .profile-form, .profile-preview { padding: 2rem; border-radius: 1.5rem; }
        .form-section { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .form-section h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--primary); }
        .input-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; }
        .glass-input { width: 100%; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 0.8rem 1rem; color: var(--text-main); font-family: inherit; outline: none; }
        .primary-btn-wide { width: 100%; background: var(--primary-gradient); color: white; border: none; padding: 1rem; border-radius: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.75rem; cursor: pointer; transition: 0.2s; }
        .mock-search-result { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 1rem; margin-top: 1rem; }
        .mock-pharma-name { font-weight: 800; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .mock-dist { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; }
        .mock-status { display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 1rem; margin-bottom: 0.75rem; }
        .mock-status.available { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .mock-address { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
        .mock-call-btn { width: 100%; border: 1px solid var(--primary); color: var(--primary); background: none; padding: 0.6rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        @media (max-width: 1024px) { .profile-content-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default PharmacyProfile;
