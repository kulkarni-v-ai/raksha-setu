import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, LogOut, Menu, X, Radio, Map as MapIcon, Users,
  Bell, Settings, Ambulance as AmbulanceIcon, Activity, Sun, Moon, User, ArrowLeft
} from 'lucide-react';
import { useResponder } from '../../context/ResponderContext';

const ResponderLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const { availability, responders } = useResponder();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user-role');
  let user = { name: 'Responder' };
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      user = JSON.parse(userStr);
    }
  } catch(e) { console.error("Safe parse error", e); }
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = userRole === 'control' 
    ? [
        { name: 'Live Emergencies', path: '/responder/control', icon: <Radio size={22} /> },
        { name: 'Manage Responders', path: '/responder/management', icon: <Users size={22} /> }
      ]
    : [
        { name: 'Dashboard', path: '/responder/field', icon: <Activity size={22} /> },
        { name: 'Task History', path: '/responder/history', icon: <Radio size={22} /> },
        { name: 'Performance', path: '/responder/performance', icon: <Users size={22} /> }
      ];

  const isFieldView = location.pathname.startsWith('/responder/field') || 
                      location.pathname.startsWith('/responder/tracking');
  const isTrackingView = location.pathname.startsWith('/responder/tracking');

  return (
    <div className={`user-root-layout ${isFieldView ? 'field-layout' : 'has-user-sidebar'} ${isDark ? 'dark-theme' : 'light-theme'}`}>
      
      {/* 60px STICKY HEADER */}
      {/* GLOBAL BRANDING HEADER */}
      <header className="rl-global-banner">
        <div className="header-left">
          {isTrackingView && (
            <button className="back-nav-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>
          )}
          <div className="rl-brand-section" onClick={() => navigate('/responder/field')}>
              <div className="rl-logo-outer">
                <ShieldCheck size={22} color="white" fill="rgba(255,255,255,0.2)" />
              </div>
              <span className="rl-logo-text">RakshaSetu</span>
          </div>
        </div>

        <div className="header-right">
            <button className="icon-link theme-toggle" onClick={toggleTheme}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-link profile-btn">
              <User size={20} />
            </button>
            <button className="icon-link notify-btn">
              <Bell size={20} />
              <span className="notification-badge">2</span>
            </button>
        </div>
      </header>

      {/* SIDEBAR (Drawer style for mobile-first) */}
      {!isFieldView && (
        <aside className={`user-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="user-app-logo" onClick={() => navigate('/login')}>
              <ShieldCheck size={28} className="logo-icon" />
              <span className="logo-text">RakshaSetu</span>
            </div>
            <button className="sidebar-toggle-btn desktop-only" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path} 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <div className="link-icon">{item.icon}</div>
                <span className="link-text">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      )}
      
      <main className="user-main-content">
        <div className={`user-content-viewport ${isFieldView ? 'full-bleed' : ''}`}>
          <Outlet />
        </div>
        
        {/* MOBILE NAVIGATION PILL (For Field Responders) */}
        {userRole === 'field' && !isTrackingView && (
          <div className="mobile-pill-nav animate-slide-up">
             {navItems.map(item => (
               <NavLink key={item.name} to={item.path} className={({isActive}) => `pill-item ${isActive ? 'active' : ''}`}>
                  {item.icon}
               </NavLink>
             ))}
          </div>
        )}
      </main>

      <style>{`
        /* ------------------------
           GLOBAL LAYOUT STYLES
           ------------------------ */
        .user-root-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-main);
          background-image: var(--bg-image);
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
        }

        .user-root-layout.field-layout {
          flex-direction: column;
        }

        /* ------------------------
           RESPONDER HEADER STYLES
           ------------------------ */
        .responder-main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .rl-global-banner {
          height: 65px;
          background: ${isDark ? 'rgba(15, 23, 42, 0.9)' : 'linear-gradient(135deg, #00d4e8, #0099f7)'};
          backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.25rem;
          color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          z-index: 1000; position: relative;
        }

        @media (max-width: 600px) {
          .rl-global-banner { height: 55px; padding: 0 0.75rem; }
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .back-nav-btn {
          background: none; border: none; color: white;
          cursor: pointer; padding: 4px; display: flex; align-items: center;
          margin-right: 0.25rem; transition: 0.2s;
        }
        .back-nav-btn:hover { opacity: 0.8; transform: translateX(-2px); }

        .rl-brand-section { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
        .rl-logo-outer { width: 34px; height: 34px; background: rgba(255,255,255,0.15); border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .rl-logo-text { font-size: 1.1rem; font-weight: 950; letter-spacing: -0.03em; }

        @media (max-width: 600px) {
          .rl-logo-outer { width: 28px; height: 28px; }
          .rl-logo-text { font-size: 0.95rem; }
        }

        .header-right { display: flex; align-items: center; gap: 0.75rem; }

        .icon-link {
          background: rgba(255,255,255,0.15); 
          border: none;
          color: white; 
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; transition: 0.2s;
          position: relative;
        }
        .icon-link:hover { background: rgba(255,255,255,0.25); }

        .notification-badge {
          position: absolute; top: -2px; right: -2px;
          background: #ef4444; color: white; border: 2px solid ${isDark ? '#1e293b' : 'white'};
          font-size: 0.65rem; font-weight: 900; padding: 1px 5px; border-radius: 10px;
        }

        .user-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          position: relative;
        }

        .user-content-viewport {
          padding: 1rem;
          max-width: 1300px;
          margin: 0 auto;
          width: 100%;
        }

        .user-content-viewport.full-bleed {
          padding: 0 !important;
          max-width: none !important;
          height: 100vh;
          overflow: hidden;
        }

        @media (min-width: 1024px) {
          .user-content-viewport:not(.full-bleed) {
            padding: 1.5rem;
          }
        }

        @media (max-width: 1024px) {
          .user-main-content {
             padding-bottom: 70px;
          }
        }

        /* ------------------------
           MOBILE PILL NAV STYLES
           ------------------------ */
        .mobile-pill-nav {
          display: flex;
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          padding: 0.5rem;
          border-radius: 2rem;
          gap: 0.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          z-index: 1000;
        }
        .dark-theme .mobile-pill-nav {
           box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .pill-item {
          width: 48px; height: 48px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.3s;
        }
        .pill-item:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
        .pill-item.active {
          background: var(--primary-gradient);
          color: white;
          box-shadow: 0 4px 15px var(--btn-shadow);
        }

        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUp { from { transform: translate(-50%, 100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

        /* ------------------------
           SIDEBAR STYLES
           ------------------------ */
        .user-sidebar {
          width: 230px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 1000;
        }

        .user-sidebar.closed {
          width: 80px;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }

        .user-app-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .logo-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 8px rgba(0, 212, 232, 0.4));
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.04em;
          color: var(--text-main);
          white-space: nowrap;
        }

        .user-sidebar.closed .logo-text {
          display: none;
        }

        .sidebar-toggle-btn {
           background: var(--input-bg);
           border: 1px solid var(--input-border);
           color: var(--text-muted);
           padding: 0.5rem;
           border-radius: 0.5rem;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--primary);
        }

        .sidebar-link.active {
          background: var(--primary-gradient);
          color: white !important;
          box-shadow: 0 4px 12px var(--btn-shadow);
        }

        .user-sidebar.closed .link-text {
          display: none;
        }

        .sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-user-pill {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .user-sidebar.closed .sidebar-user-pill {
            justify-content: center;
        }

        .user-avatar-small {
            width: 32px;
            height: 32px;
            background: var(--primary-gradient);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
        }

        .user-sidebar.closed .user-info-text {
          display: none;
        }

        .u-name { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .u-status { font-size: 0.7rem; color: var(--text-muted); }

        .logout-btn {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--emergency);
        }

        @media (max-width: 1024px) {
          .user-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponderLayout;
