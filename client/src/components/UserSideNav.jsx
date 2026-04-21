import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Hospital, Pill, Bot, ScanLine, User, 
  Settings, LogOut, ShieldCheck, BarChart3, Menu, X, Bell
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UserSideNav = ({ isSidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('user-token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={22} /> },
    { name: 'Hospitals', path: '/hospitals', icon: <Hospital size={22} /> },
    { name: 'Pharmacies', path: '/medicines', icon: <Pill size={22} /> },
    { name: 'AI Assistant', path: '/ai', icon: <Bot size={22} /> },
    { name: 'Scanner', path: '/scanner', icon: <ScanLine size={22} /> },
    { name: 'Profile', path: '/profile', icon: <User size={22} /> },
  ];

  return (
    <aside className={`user-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="user-app-logo" onClick={() => navigate('/dashboard')}>
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

      <div className="sidebar-footer">
        <div className="sidebar-user-pill">
            <div className="user-avatar-small">D</div>
            <div className="user-info-text">
                <span className="u-name">Divya</span>
                <span className="u-status">Pro Member</span>
            </div>
        </div>
        <button className="sidebar-link logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span className="link-text">Sign Out</span>
        </button>
      </div>

      <style>{`
        .user-sidebar {
          width: 260px;
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
    </aside>
  );
};

export default UserSideNav;
