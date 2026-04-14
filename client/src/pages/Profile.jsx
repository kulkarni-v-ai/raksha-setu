import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Droplet, AlertTriangle, Phone, LogOut, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const healthData = [
    { label: 'Blood Group', value: 'O Pos +', icon: <Droplet color="#ef4444" size={20} />, color: '#fef2f2' },
    { label: 'Allergies', value: 'Penicillin, Dust', icon: <AlertTriangle color="#f59e0b" size={20} />, color: '#fff9eb' },
    { label: 'Weight', value: '68 kg', icon: <Heart color="#ec4899" size={20} />, color: '#fdf2f8' },
    { label: 'Insurance', value: 'Policy #12345', icon: <ShieldCheck color="#3b82f6" size={20} />, color: '#eff6ff' },
  ];

  const emergencyContacts = [
    { name: 'Dr. Sameer (Physician)', phone: '+91 98765 43210' },
    { name: 'Anjali (Wife)', phone: '+91 99887 76655' },
  ];

  return (
    <div className="page-container dashboard-container">
      <header className="dashboard-header animate-slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <h2>My Health Profile</h2>
        </div>
      </header>

      <main className="profile-main animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* User Card */}
        <div className="glassmorphism" style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '1.25rem 1rem' }}>
          <div className="profile-badge" style={{ width: '60px', height: '60px', margin: '0 auto 0.75rem', fontSize: '1.5rem' }}>
            <User size={30} />
          </div>
          <h3 style={{ fontSize: '1.1rem' }}>John Doe</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Member since April 2024</p>
        </div>

        {/* Health Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {healthData.map((item, idx) => (
            <div key={idx} className="glassmorphism" style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
              <div style={{ background: item.color, padding: '0.4rem', borderRadius: '0.6rem', display: 'flex' }}>
                {item.icon}
              </div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</label>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="glassmorphism" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16} color="var(--emergency)" /> Emergency Contacts
          </h3>
          <div className="contacts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="glass" style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{contact.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{contact.phone}</p>
                </div>
                <a href={`tel:${contact.phone}`} className="call-btn" style={{ background: 'var(--bg-soft)' }}>
                  <Phone size={18} color="var(--success)" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="secondary-btn" onClick={handleLogout} style={{ color: 'var(--emergency)', borderColor: 'rgba(239, 68, 68, 0.1)', fontSize: '0.85rem', padding: '0.75rem' }}>
          <LogOut size={16} /> Logout Account
        </button>
      </main>
    </div>
  );
};

export default Profile;
