import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponder } from '../../context/ResponderContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ChevronRight, MapPin, Navigation, CheckCircle, Zap,
  ShieldAlert, Clock, Bell, Activity, AlertTriangle, User, Ambulance,
  Settings, X
} from 'lucide-react';

// ─── Severity Badge ────────────────────────────────────────────────────────────
const SeverityBadge = ({ severity }) => {
  const config = {
    Critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: '🔴 CRITICAL' },
    High:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: '🟠 HIGH' },
    Medium:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: '🔵 MEDIUM' },
    Low:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: '🟢 LOW' },
  };
  const c = config[severity] || config.Medium;
  return (
    <span style={{
      fontSize: '0.6rem', fontWeight: 900, padding: '3px 9px', borderRadius: 6,
      color: c.color, background: c.bg, letterSpacing: '0.05em'
    }}>{c.label}</span>
  );
};

// ─── Mission Card ──────────────────────────────────────────────────────────────
const MissionCard = ({ mission, onTrack }) => {
  const statusConfig = {
    Pending:    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'PENDING' },
    Accepted:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'ACCEPTED' },
    Dispatched: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'DISPATCHED' },
    'On the way':{ color: '#00d4e8', bg: 'rgba(0,212,232,0.1)', label: 'EN ROUTE' },
    Reached:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  label: 'ON SCENE' },
    'Picked Up': { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'PICKED UP' },
    Completed:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'DONE' },
  };
  const sc = statusConfig[mission.status] || statusConfig.Pending;
  const timeAgo = mission.time
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(mission.time)) / 60000);
        return diff < 60 ? `${diff}m ago` : `${Math.floor(diff / 60)}h ago`;
      })()
    : 'Just now';

  return (
    <div className="fd-mission-card" onClick={() => onTrack(mission.id)}>
      <div className="fd-mc-header">
        <div className="fd-mc-title-group">
          <div className="fd-mc-type-row">
            <AlertTriangle size={14} className="fd-mc-type-icon" />
            <span className="fd-mc-type">{mission.type}</span>
          </div>
          <span className="fd-mc-id">#{mission.id?.slice(-6).toUpperCase() || 'XXXXXX'}</span>
        </div>
        <div className="fd-mc-badges">
          <SeverityBadge severity={mission.severity || 'Medium'} />
          <span className="fd-status-pill" style={{ color: sc.color, background: sc.bg }}>
            {sc.label}
          </span>
        </div>
      </div>

      <div className="fd-timeline">
        <div className="fd-tl-node">
          <div className="fd-tl-dot start-dot" />
          <div className="fd-tl-content">
            <label>PATIENT LOCATION</label>
            <p>{mission.userName || mission.address || 'Scene Location'}</p>
          </div>
        </div>
        <div className="fd-tl-line">
          <div className="fd-tl-dist">
            <Navigation size={10} />
            0.8 km · ~4 min
          </div>
        </div>
        <div className="fd-tl-node">
          <div className="fd-tl-dot end-dot" />
          <div className="fd-tl-content">
            <label>DESTINATION</label>
            <p>Max Super Speciality Hospital</p>
          </div>
        </div>
      </div>

      <div className="fd-mc-footer">
        <span className="fd-mc-time"><Clock size={12} /> {timeAgo}</span>
        <button className="fd-track-btn" onClick={(e) => { e.stopPropagation(); onTrack(mission.id); }}>
          Track Mission <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Duty Toggle ───────────────────────────────────────────────────────────────
const DutyToggle = ({ isOnDuty, onToggle }) => (
  <div className="fd-duty-toggle" onClick={onToggle}>
    <span className="fd-duty-label">{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
    <div className={`fd-toggle-track ${isOnDuty ? 'active' : ''}`}>
      <div className="fd-toggle-thumb" />
    </div>
  </div>
);

// ─── Live Session Timer ────────────────────────────────────────────────────────
const useSessionTimer = (startTime) => {
  const [elapsed, setElapsed] = useState('00:00:00');
  useEffect(() => {
    const tick = () => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
};

// ─── Main FieldDashboard ───────────────────────────────────────────────────────
const FieldDashboard = () => {
  const { activeAlerts, getPerformanceStats, dutyStatus, setDutyStatus, sessionStartTime, getUnreadAlertCount, taskHistory } = useResponder();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const stats = getPerformanceStats();
  const elapsed = useSessionTimer(sessionStartTime);
  const [filter, setFilter] = useState('All');

  // Modal State (Using exact names from User request)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const userStr = localStorage.getItem('user');
  const user = (userStr && userStr !== 'null' && userStr !== 'undefined') ? JSON.parse(userStr) : {};
  const responderName = user.name || 'Field Responder';
  const responderId = user._id?.slice(-4).toUpperCase() || user.id?.slice(-4).toUpperCase() || 'F001';

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const unreadCount = getUnreadAlertCount();

  const filteredMissions = filter === 'Completed' 
    ? (taskHistory || []) 
    : activeAlerts.filter(m => {
        if (filter === 'All') return m.status !== 'Cancelled' && m.status !== 'Resolved';
        if (filter === 'Deployed') return ['Pending', 'Deployed', 'En Route'].includes(m.status);
        if (filter === 'In Transit') return ['On Scene', 'Patient Onboard', 'Clinical Handover'].includes(m.status);
        return true;
      });

  const handleSaveProfile = () => {
    const updatedUser = { ...user, name: editName || user.name, phone: editPhone || user.phone };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsModalOpen(false);
    window.location.reload(); 
  };

  const openSettings = () => {
    setEditName(responderName);
    setEditPhone(user.phone || '');
    setIsModalOpen(true);
  };

  return (
    <div className={`fd-container ${isDark ? 'dark' : 'light'}`}>
      <header className="fd-header">
        <div className="fd-header-left">
          <p className="fd-date-day">{dayName}</p>
          <h2 className="fd-date-full">{dateStr}</h2>
        </div>
        <div className="fd-header-right">
          <button className="fd-bell-btn" onClick={() => navigate('/responder/history')}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="fd-notif-dot">{unreadCount}</span>}
          </button>
        </div>
      </header>

      <section className="fd-profile-card">
        <div className="fd-profile-row">
          <div className="fd-avatar">
            <Ambulance size={22} className="fd-avatar-icon" />
          </div>
          <div className="fd-profile-info">
            <h3 className="fd-profile-name">{responderName}</h3>
            <span className="fd-profile-id">UNIT #{responderId}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <DutyToggle isOnDuty={dutyStatus} onToggle={() => setDutyStatus(d => !d)} />
             <div className="fd-edit-profile" title="Update Profile" onClick={openSettings}>
               <Settings size={16} />
             </div>
          </div>
        </div>
        <div className="fd-metrics-row">
          <div className="fd-metric">
            <Zap size={16} className="fd-m-icon" style={{ color: '#f59e0b' }} />
            <div><span className="fd-m-val">{stats.total}</span><span className="fd-m-lbl">Tasks</span></div>
          </div>
          <div className="fd-metric-divider" />
          <div className="fd-metric">
            <Clock size={16} className="fd-m-icon" style={{ color: '#3b82f6' }} />
            <div><span className="fd-m-val">{stats.activeHours}</span><span className="fd-m-lbl">Hrs</span></div>
          </div>
          <div className="fd-metric-divider" />
          <div className="fd-metric">
            <Activity size={16} className="fd-m-icon" style={{ color: '#10b981' }} />
            <div><span className="fd-m-val">{stats.avgResponse}</span><span className="fd-m-lbl">Resp</span></div>
          </div>
        </div>
        <div className="fd-timer-row">
          <span className="fd-timer-lbl">Session Duration</span>
          <span className="fd-timer-value">{elapsed}</span>
        </div>
      </section>

      <section className="fd-mission-section">
        <div className="fd-section-header">
          <h3 className="fd-section-title">My Tasks</h3>
          <div className="fd-filter-tabs">
            {['All', 'Deployed', 'In Transit', 'Completed'].map(f => (
              <button key={f} className={`fd-filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="fd-missions-list">
          {filteredMissions.length > 0 ? filteredMissions.map(m => (
            <MissionCard key={m.id} mission={m} onTrack={(id) => navigate(`/responder/tracking/${id}`)} />
          )) : (
            <div className="fd-empty-state">
              <CheckCircle size={48} className="fd-empty-icon" />
              <h4>All Clear!</h4>
              <p>No {filter === 'All' ? 'active' : filter.toLowerCase()} tasks assigned.</p>
            </div>
          )}
        </div>
      </section>

      {/* BOSS CENTERING MODAL */}
      {isModalOpen && (
        <div className="fm-overlay">
          <div className="fm-modal-box glassmorphism animate-pop">
            <div className="fd-modal-header">
              <h3>Update Profile</h3>
              <button className="fd-modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="fd-modal-body">
              <div className="fd-input-group">
                <label>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
              </div>
              <div className="fd-input-group">
                <label>Contact Number</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" />
              </div>
              <button className="fd-save-btn" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fd-container { padding: 1.1rem; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; animation: fdFade 0.4s ease-out; }
        @keyframes fdFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; filter: none; } }
        .fd-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .fd-date-day { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
        .fd-date-full { font-size: 1.4rem; font-weight: 950; color: #0f172a; margin: 0; }
        .dark .fd-date-full { color: white; }
        .fd-bell-btn { position: relative; width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; display: flex; align-items: center; justify-content: center; }
        .fd-notif-dot { position: absolute; top: -2px; right: -2px; width: 16px; height: 16px; background: #ef4444; color: white; font-size: 0.6rem; font-weight: 900; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

        .fd-profile-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95)); border-radius: 1.5rem; padding: 1.25rem; color: white; display: flex; flex-direction: column; gap: 1rem; border: 1px solid rgba(255,255,255,0.1); }
        .light .fd-profile-card { background: white; color: #0f172a; border-color: #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .fd-profile-row { display: flex; align-items: center; gap: 1rem; }
        .fd-avatar { width: 44px; height: 44px; border-radius: 50%; background: #00d4e8; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 16px rgba(0,212,232,0.3); }
        .fd-profile-info { flex: 1; }
        .fd-profile-name { font-size: 1rem; font-weight: 850; margin: 0; }
        .fd-profile-id { font-size: 0.65rem; color: #94a3b8; font-weight: 700; }
        .fd-edit-profile { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer; transition: 0.2s; }
        .fd-edit-profile:hover { transform: scale(1.1); color: #00d4e8; background: white; }
        .fd-metrics-row { display: flex; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 1rem; }
        .light .fd-metrics-row { background: #f8fafc; }
        .fd-metric { display: flex; align-items: center; gap: 0.5rem; }
        .fd-m-val { display: block; font-size: 1rem; font-weight: 900; }
        .fd-m-lbl { font-size: 0.6rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
        .fd-metric-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.1); }
        .fd-timer-row { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem; }
        .fd-timer-value { color: #00d4e8; }

        .fd-mission-section { margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        .fd-section-header { display: flex; justify-content: space-between; align-items: center; }
        .fd-section-title { font-size: 1.1rem; font-weight: 950; }
        .fd-filter-tabs { display: flex; gap: 0.5rem; }
        .fd-filter-tab { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; cursor: pointer; }
        .fd-filter-tab.active { background: #00d4e8; color: white; border-color: #00d4e8; box-shadow: 0 4px 12px rgba(0,212,232,0.3); }

        .fd-mission-card { background: ${isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; border-radius: 1.25rem; padding: 1.25rem; box-shadow: 0 6px 20px rgba(0,0,0,0.05); animation: fdPop 0.3s ease-out; cursor: pointer; }
        @keyframes fdPop { from { opacity: 0; transform: scale(0.98); } }
        .fd-mc-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .fd-mc-type { font-size: 0.95rem; font-weight: 850; }
        .fd-mc-id { font-size: 0.6rem; color: #94a3b8; font-weight: 700; }
        .fd-mc-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .fd-status-pill { font-size: 0.6rem; font-weight: 900; padding: 2px 8px; border-radius: 6px; }

        .fd-timeline { border-left: 2px dashed #94a3b8; margin: 1rem 0 1rem 0.5rem; padding-left: 1rem; display: flex; flex-direction: column; gap: 1rem; position: relative; }
        .fd-tl-dot { position: absolute; left: -7px; width: 12px; height: 12px; border-radius: 50%; background: #00d4e8; border: 2px solid white; }
        .start-dot { top: 0; background: #ef4444; }
        .end-dot { bottom: 0; background: #00d4e8; }
        .fd-tl-content label { display: block; font-size: 0.55rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
        .fd-tl-content p { font-size: 0.85rem; font-weight: 700; margin: 0; }
        .fd-tl-dist { font-size: 0.65rem; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 4px; }

        .fd-mc-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid rgba(148,163,184,0.1); padding-top: 1rem; }
        .fd-mc-time { font-size: 0.7rem; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .fd-track-btn { padding: 6px 14px; background: #00d4e8; color: white; border: none; border-radius: 10px; font-size: 0.75rem; font-weight: 850; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,212,232,0.3); }

        .fd-empty-state { text-align: center; padding: 3rem 0; color: #94a3b8; }
        .fd-empty-icon { margin-bottom: 1rem; opacity: 0.2; color: #00d4e8; }

        /* Duty Toggle */
        .fd-duty-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .fd-duty-label { font-size: 0.6rem; font-weight: 900; color: #94a3b8; }
        .fd-toggle-track { width: 44px; height: 22px; border-radius: 11px; background: rgba(0,0,0,0.1); position: relative; transition: 0.3s; }
        .fd-toggle-track.active { background: #00d4e8; }
        .fd-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .active .fd-toggle-thumb { transform: translateX(22px); }

        /* BOSS CENTERING MODAL LOGIC */
        .fm-overlay { 
          position: fixed; 
          inset: 0; 
          z-index: 9999; 
          background: rgba(0,0,0,0.85); 
          backdrop-filter: blur(12px); 
          display: flex;           
          align-items: center;     
          justify-content: center; 
          padding: 1.5rem;         
        }

        .fm-modal-box { 
          width: 100%; 
          max-width: 400px;        
          max-height: 90vh;        
          overflow-y: auto;        
          background: ${isDark ? '#0f172a' : 'white'};
          border-radius: 1.8rem; 
          padding: 2.25rem; 
          box-shadow: 0 30px 70px rgba(0,0,0,0.6); 
          position: relative;
          border: 1px solid rgba(255,255,255,0.1);
        }

        @keyframes fdModalPop { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-pop { animation: fdModalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        .fd-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .fd-modal-header h3 { font-size: 1.25rem; font-weight: 950; margin: 0; }
        .fd-modal-close { background: none; border: none; color: #94a3b8; cursor: pointer; }
        .fd-input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem; }
        .fd-input-group label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .fd-input-group input { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; color: ${isDark ? 'white' : '#0f172a'}; font-size: 0.95rem; outline: none; transition: 0.2s; }
        .fd-input-group input:focus { border-color: #00d4e8; background: rgba(0,0,0,0.3); }
        .fd-save-btn { width: 100%; padding: 1.1rem; background: linear-gradient(135deg, #00d4e8, #0099f7); color: white; border: none; border-radius: 14px; font-weight: 950; font-size: 1rem; cursor: pointer; box-shadow: 0 10px 25px rgba(0,212,232,0.3); margin-top: 1rem; }
      `}</style>
    </div>
  );
};

export default FieldDashboard;
