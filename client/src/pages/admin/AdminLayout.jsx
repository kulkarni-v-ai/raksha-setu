import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Hospital, Pill, ShieldAlert, 
  BarChart3, Settings, LogOut, Bell, Search, Menu, X 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminBottomNav from '../../components/AdminBottomNav';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  // Auto-close sidebar on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/overview', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Hospitals', path: '/admin/hospitals', icon: <Hospital size={20} /> },
    { name: 'Pharmacies', path: '/admin/pharmacies', icon: <Pill size={20} /> },
    { name: 'SOS Alerts', path: '/admin/sos', icon: <ShieldAlert size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className={`admin-root-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* Background Decor */}
      <div className="admin-bg-decor">
        <div className="decor-circle circle-1"></div>
        <div className="decor-circle circle-2"></div>
      </div>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <ShieldAlert size={28} color="var(--admin-primary)" />
            <span>Raksha Admin</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
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
              {item.icon}
              <span className="link-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span className="link-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <div className="admin-search-box">
              <Search size={18} />
              <input type="text" placeholder="Global search..." />
            </div>
          </div>
          
          <div className="header-right">
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="admin-profile-pill">
              <div className="admin-avatar">A</div>
              <div className="admin-info">
                <span className="admin-name">Master Admin</span>
                <span className="admin-role">System Root</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content-viewport">
          <Outlet />
        </div>

        <AdminBottomNav />
      </div>

      <style>{`
        .admin-root-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-main);
          background-image: var(--bg-image);
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .admin-bg-decor {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          pointer-events: none;
        }

        .decor-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }

        .circle-1 {
          width: 500px;
          height: 500px;
          background: var(--primary);
          top: -250px;
          right: -100px;
        }

        .circle-2 {
          width: 400px;
          height: 400px;
          background: var(--primary-light);
          bottom: -200px;
          left: -100px;
        }

        /* Sidebar Styles */
        .admin-sidebar {
          width: var(--admin-sidebar-w, 260px);
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 1000;
        }

        .admin-sidebar.closed {
          width: var(--admin-sidebar-closed, 0px);
          transform: translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--admin-border);
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.15rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
        }

        .admin-sidebar.closed .admin-logo span {
          display: none;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
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
          white-space: nowrap;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--primary);
        }

        .sidebar-link.active {
          background: var(--primary-gradient);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px var(--btn-shadow);
        }

        .admin-sidebar.closed .link-text {
          display: none;
        }

        .sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid var(--border-color);
        }

        .sidebar-link.logout {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
        }

        .sidebar-link.logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--emergency);
        }

        /* Main Content */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .admin-header {
          height: 70px;
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 900;
        }

        .admin-search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          width: 320px;
          color: var(--text-muted);
        }

        .admin-search-box input {
          background: none;
          border: none;
          outline: none;
          font-family: inherit;
          width: 100%;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon-btn {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          position: relative;
          cursor: pointer;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: var(--emergency);
          border-radius: 50%;
          border: 2px solid var(--bg-main);
        }

        .admin-profile-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1.25rem;
          border-left: 1px solid var(--border-color);
        }

        .admin-avatar {
          width: 36px;
          height: 36px;
          background: var(--primary-gradient);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .admin-info {
          display: flex;
          flex-direction: column;
        }

        .admin-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .admin-role {
          font-size: 0.75rem;
          color: var(--admin-text-muted);
        }

        .admin-content-viewport {
          padding: 2rem;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .admin-sidebar {
            width: 0;
            position: absolute;
            z-index: 2000;
          }
          
          .admin-content-viewport {
            padding: 1.5rem 1rem 6rem 1rem;
          }

          .admin-header {
            padding: 0 1rem;
          }

          .admin-search-box {
            display: none;
          }
           .admin-logo span {
             display: none;
           }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
