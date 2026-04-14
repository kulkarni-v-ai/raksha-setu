import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Hospital, Pill, 
  ShieldAlert, BarChart3 
} from 'lucide-react';

const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Main', path: '/admin/overview' },
    { icon: <Hospital size={22} />, label: 'Rescue', path: '/admin/hospitals' },
    { icon: <ShieldAlert size={26} />, label: 'SOS', path: '/admin/sos', special: true },
    { icon: <Pill size={22} />, label: 'Meds', path: '/admin/pharmacies' },
    { icon: <BarChart3 size={22} />, label: 'Data', path: '/admin/analytics' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav admin-bottom-nav">
      {navItems.map((item, index) => (
        <div 
          key={index} 
          className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.special ? 'sos-nav' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.special ? (
            <div className="sos-nav-btn admin-sos-glow">
              {item.icon}
            </div>
          ) : (
            <>
              {item.icon}
              <span>{item.label}</span>
            </>
          )}
        </div>
      ))}

      <style>{`
        .admin-bottom-nav {
           background: var(--glass-bg);
           backdrop-filter: blur(24px);
           border-top: 1px solid var(--glass-border);
        }

        .admin-sos-glow {
            background: var(--emergency) !important;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        @media (min-width: 769px) {
          .admin-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default AdminBottomNav;
