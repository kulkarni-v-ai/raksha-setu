import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, NavLink, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Search, Sun, Moon, User, LogOut, 
  LayoutDashboard, Database, BarChart3, Settings, Menu, X, History, Bell, Inbox
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePharmacy } from '../../context/PharmacyContext';
import PharmacyBottomNav from '../../components/PharmacyBottomNav';

const PharmacyLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadNotifs, markAllNotificationsRead } = usePharmacy();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user-role');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/pharmacy/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Inbox', path: '/pharmacy/orders', icon: <Inbox size={20} /> },
    { name: 'Warehouse', path: '/pharmacy/medicines', icon: <Database size={20} /> },
    { name: 'Analytics', path: '/pharmacy/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Profile', path: '/pharmacy/profile', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`pharmacy-platform-root ${isDark ? 'dark-theme' : 'light-theme'}`}>
      
      {/* BACKGROUND GRADIENTS (The 'WOW' factor foundation) */}
      <div className="platform-background-blobs">
         <div className="blob-1"></div>
         <div className="blob-2"></div>
      </div>

      {/* 1. SIDEBAR (Premium Glass) */}
      <aside className={`platform-sidebar glass-surface ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
           <Link to="/pharmacy/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'inherit' }}>
             <ShieldCheck size={28} color="#0ea5e9" />
             <span style={{ fontWeight: 850, fontSize: '1.2rem', fontSize: isSidebarOpen ? '1.2rem' : '0px', transition: '0.2s', overflow: 'hidden' }}>Raksha Pharmacy</span>
           </Link>
           <button 
             className="desktop-only" 
             style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
             onClick={() => setSidebarOpen(!isSidebarOpen)}
           >
             {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
           <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
             <X size={20} />
           </button>
        </div>

        <nav className="sidebar-nav-list">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="link-icon-wrap">{link.icon}</div>
              <span className="link-text">{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer glass-footer">
           <div className="user-profile-mini" style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="avatar-pro" style={{ background: '#0ea5e9', color: 'white' }}>R</div>
              <div className="user-info-text">
                 <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.15rem' }}>Raksha Pharmacy</strong>
                 <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>Active Partner</span>
              </div>
           </div>
           
           <button 
             className="sidebar-link mobile-logout-btn" 
             style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'transparent' }}
             onClick={handleLogout}
           >
             <div className="link-icon-wrap" style={{ color: '#ef4444' }}><LogOut size={20} /></div>
             <span className="link-text" style={{ color: '#ef4444', fontWeight: '800' }}>Secure Sign Out</span>
           </button>
        </div>
      </aside>

      {/* 2. MOBILE OVERLAY BACKDROP */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>}

      {/* 3. MAIN CONTENT AREA */}
      <div className="platform-main-container">
        {/* TOP HEADER (Premium Glass) */}
        <header className="platform-top-header glass-surface border-bottom">
           <div className="header-left">
              <button className="mobile-menu-trigger" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="header-search-wrap glass-search">
                 <Search size={18} className="search-icon-dim" />
                 <input 
                   type="text" 
                   placeholder="Global search assets..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && navigate(`/pharmacy/medicines?search=${searchQuery}`)}
                 />
              </div>
           </div>

           <div className="header-right">
              <div className="action-hub">
                 <button className="header-icon-btn glass-btn" onClick={toggleTheme} title="Toggle Theme">
                   {isDark ? <Sun size={20} /> : <Moon size={20} />}
                 </button>
                 <button 
                   className="header-icon-btn glass-btn notif-btn" 
                   title="Notifications"
                   onClick={() => {
                     setShowNotifMenu(!showNotifMenu);
                     if (unreadNotifs > 0 && showNotifMenu) markAllNotificationsRead();
                   }}
                 >
                   <Bell size={20} />
                   {unreadNotifs > 0 && <span className="notif-badge-dot"></span>}
                 </button>
                 
                 {/* Notifications Dropdown */}
                 {showNotifMenu && (
                   <div className="notif-dropdown glass-surface shadow-premium animate-fade-in" style={{ position: 'absolute', top: '70px', right: '80px', width: '320px', borderRadius: '16px', zIndex: 1000, padding: '1rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(125,125,125,0.1)', paddingBottom: '0.5rem' }}>
                       <h4 style={{ margin: 0, fontSize: '0.95rem' }}>System Alerts</h4>
                       {unreadNotifs > 0 && <button style={{ border: 'none', background: 'transparent', color: '#0ea5e9', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }} onClick={markAllNotificationsRead}>Mark Read</button>}
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
                       {notifications.length === 0 ? (
                         <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.85rem', padding: '1rem 0' }}>No recent alerts.</div>
                       ) : (
                         notifications.map(n => (
                           <div key={n.id} style={{ display: 'flex', gap: '0.8rem', padding: '0.5rem', borderRadius: '8px', background: n.read ? 'transparent' : 'rgba(14, 165, 233, 0.05)' }}>
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'success' ? '#10b981' : n.type === 'warning' ? '#f59e0b' : '#0ea5e9', marginTop: '6px' }}></div>
                             <div>
                               <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>{n.message}</p>
                               <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{n.time}</span>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   </div>
                 )}

                 <div className="divider-v"></div>
                 <button className="header-icon-btn glass-btn logout-lite" onClick={handleLogout} title="Logout">
                   <LogOut size={20} />
                 </button>
              </div>
           </div>
        </header>

        {/* CONTENT CANVAS */}
        <main className="platform-content-canvas">
           <div className="canvas-wrapper">
              <Outlet />
           </div>
        </main>
      </div>

      {/* Bottom Nav lives outside the scroll container so it's always visible */}
      <PharmacyBottomNav />

      <style>{`
        .pharmacy-platform-root {
          display: flex;
          min-height: 100vh;
          background: #f0f9ff;
          color: #0f172a;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .dark-theme.pharmacy-platform-root {
          background: #0b0f19;
          color: #e2e8f0;
        }

        /* Platform Background Blobs */
        .platform-background-blobs {
           position: fixed;
           inset: 0;
           z-index: 0;
           pointer-events: none;
        }
        .blob-1 {
           position: absolute;
           top: -10%; left: -10%;
           width: 60%; height: 60%;
           background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%);
           filter: blur(100px);
        }
        .blob-2 {
           position: absolute;
           bottom: -10%; right: -10%;
           width: 50%; height: 50%;
           background: radial-gradient(circle, rgba(0, 212, 232, 0.08) 0%, transparent 70%);
           filter: blur(80px);
        }

        /* Glass Surface Utility */
        .glass-surface {
          background: rgba(255, 255, 255, 0.4) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
        }
        .dark-theme .glass-surface {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
        }

        /* Sidebar Styling */
        .platform-sidebar {
          width: 240px;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 1000;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 1024px) {
          .platform-sidebar { width: 240px; transform: translateX(0) !important; }
          .platform-sidebar:not(.is-open) { width: 80px; }
          .platform-sidebar:not(.is-open) .brand-text-pro, 
          .platform-sidebar:not(.is-open) .link-text, 
          .platform-sidebar:not(.is-open) .user-info-text { display: none; }
          .platform-sidebar:not(.is-open) .sidebar-link { justify-content: center; padding: 0.7rem 0; }
          .platform-sidebar:not(.is-open) .sidebar-footer { padding: 1.5rem 0.5rem; text-align: center; }
          
          .platform-main-container { margin-left: 240px; transition: margin 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          .platform-sidebar:not(.is-open) + * + .platform-main-container { margin-left: 80px; }
          .platform-sidebar:not(.is-open) ~ .platform-main-container { margin-left: 80px; }
          
          .mobile-menu-trigger, .mobile-close-btn, .sidebar-backdrop { display: none !important; }
        }

        @media (max-width: 1023px) {
          .platform-sidebar { transform: translateX(-100%); width: 260px; }
          .platform-sidebar.is-open { transform: translateX(0); }
          .platform-main-container { margin-left: 0; }
          .mobile-menu-trigger { display: flex !important; margin-right: 1.5rem; }
          .mobile-close-btn { display: flex !important; background: none; border: none; color: #64748b; }
          .desktop-only { display: none !important; }
          .sidebar-backdrop {
             position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px); z-index: 999;
          }
        }

        .sidebar-header { padding: 1.25rem 1.25rem; display: flex; align-items: center; justify-content: space-between; }
        .brand-icon-wrap-pro {
           background: #0ea5e9; padding: 0.4rem; border-radius: 10px; display: flex; 
           box-shadow: 0 4px 10px rgba(14, 165, 233, 0.25);
        }
        .brand-icon-pro { color: white; }
        .brand-text-pro { font-weight: 850; font-size: 1.1rem; color: #0ea5e9; margin-left: 0.6rem; }

        .sidebar-nav-list { flex: 1; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .sidebar-link {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1rem;
          text-decoration: none; color: #64748b; border-radius: 12px; font-weight: 600; font-size: 0.85rem; transition: 0.2s;
        }
        .sidebar-link:hover { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }
        .sidebar-link.active {
          background: #0ea5e9; color: white; box-shadow: 0 6px 14px rgba(14, 165, 233, 0.25);
        }

        .sidebar-footer { padding: 1.5rem; }
        .glass-footer { border-top: 1px solid rgba(0,0,0,0.05); }
        .dark-theme .glass-footer { border-top-color: rgba(255,255,255,0.05); }

        .platform-main-container { flex: 1; position: relative; z-index: 10; display: flex; flex-direction: column; }
        
        /* Top Header */
        .platform-top-header {
          height: 60px; display: flex; align-items: center; justify-content: space-between; 
          padding: 0 1.5rem; position: sticky; top: 0; z-index: 900;
        }
        .border-bottom { border-bottom: 1px solid rgba(0,0,0,0.05) !important; }
        .dark-theme .border-bottom { border-bottom-color: rgba(255,255,255,0.05) !important; }

        .header-left { display: flex; align-items: center; }
        .mobile-menu-trigger {
           width: 36px; height: 36px; border-radius: 10px; border: none; background: rgba(255,255,255,0.6); 
           color: #1e293b; display: none; align-items: center; justify-content: center; cursor: pointer;
        }
        .dark-theme .mobile-menu-trigger { background: rgba(255,255,255,0.05); color: white; }

        .glass-search {
          position: relative; width: 320px; max-width: 100%; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px;
        }
        .dark-theme .glass-search { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); }
        .search-icon-dim { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .glass-search input {
          width: 100%; padding: 0.6rem 1rem 0.6rem 2.75rem; border: none; background: transparent;
          font-family: inherit; font-size: 0.85rem; outline: none; color: inherit;
        }

        .action-hub { display: flex; align-items: center; gap: 0.5rem; }
        .glass-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.05); 
          background: rgba(255,255,255,0.6); color: #64748b; display: flex; align-items: center; justify-content: center; 
          cursor: pointer; transition: 0.2s; position: relative;
        }
        .dark-theme .glass-btn { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); }
        .glass-btn:hover { background: #0ea5e9; color: white; border-color: #0ea5e9; transform: translateY(-2px); }
        
        .notif-badge-dot {
           position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: #ef4444; 
           border-radius: 50%; border: 2px solid white;
        }
        .dark-theme .notif-badge-dot { border-color: #1e293b; }

        .divider-v { width: 1px; height: 28px; background: rgba(0,0,0,0.08); margin: 0 0.5rem; }
        .dark-theme .divider-v { background: rgba(255,255,255,0.08); }
        .logout-lite:hover { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }

        .platform-content-canvas { padding: 1.5rem; flex: 1; }
        /* On mobile, responsive fixes */
        @media (max-width: 1023px) {
          .platform-content-canvas { padding: 1rem 0.75rem 7rem; }
          .platform-top-header { padding: 0 1rem; }
          .glass-search { flex: 1; min-width: 100px; width: auto; margin-right: 0.5rem; }
          .header-icon-btn.logout-lite, .divider-v { display: none; }
        }
        
        @media (min-width: 1024px) {
          .mobile-logout-btn { display: none !important; }
        }
        .canvas-wrapper { max-width: 1400px; margin: 0 auto; }
      `}</style>
    </div>
  );
};

export default PharmacyLayout;
