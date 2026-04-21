import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, BarChart3, Settings, Inbox } from 'lucide-react';

const PharmacyBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/pharmacy/dashboard' },
    { icon: <Inbox size={22} />,           label: 'Inbox',     path: '/pharmacy/orders' },
    { icon: <Database size={22} />,        label: 'Warehouse', path: '/pharmacy/medicines' },
    { icon: <BarChart3 size={22} />,       label: 'Analytics', path: '/pharmacy/analytics'   },
    { icon: <Settings size={22} />,        label: 'Profile',   path: '/pharmacy/profile'   },
  ];

  // Exact-match active check
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="pharmacy-bottom-nav-shell" role="navigation" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`pbn-item ${isActive(item.path) ? 'pbn-active' : ''}`}
          aria-label={item.label}
        >
          <div className="pbn-icon">{item.icon}</div>
          <span className="pbn-label">{item.label}</span>
          {isActive(item.path) && <div className="pbn-active-pill" />}
        </NavLink>
      ))}

      <style>{`
        /* === PHARMACY BOTTOM NAV === */
        /* Only visible on screens narrower than 1024px */
        .pharmacy-bottom-nav-shell {
          display: none;
          position: fixed;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 2rem);
          max-width: 480px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 28px;
          padding: 0 0.5rem;
          height: 68px;
          justify-content: space-around;
          align-items: center;
          z-index: 9999;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        .dark-theme .pharmacy-bottom-nav-shell {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        /* Show only on mobile (<1024px) */
        @media (max-width: 1023px) {
          .pharmacy-bottom-nav-shell {
            display: flex;
          }
        }

        .pbn-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 0.5rem 1rem;
          text-decoration: none;
          color: #94a3b8;
          border-radius: 16px;
          position: relative;
          transition: color 0.2s ease, background 0.2s ease;
          min-width: 60px;
        }
        .pbn-item:hover {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.08);
        }
        .pbn-item.pbn-active {
          color: #0ea5e9;
        }
        .pbn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pbn-item.pbn-active .pbn-icon {
          transform: translateY(-2px);
        }
        .pbn-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .pbn-active-pill {
          position: absolute;
          bottom: 6px;
          width: 4px;
          height: 4px;
          background: #0ea5e9;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(14, 165, 233, 0.6);
        }
      `}</style>
    </nav>
  );
};

export default PharmacyBottomNav;
