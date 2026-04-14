import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShieldAlert, Hospital, User, Pill } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} />, label: 'Home', path: '/dashboard' },
    { icon: <Hospital size={24} />, label: 'Hospitals', path: '/hospitals' },
    { icon: <ShieldAlert size={28} />, label: 'SOS', path: '/sos', special: true },
    { icon: <Pill size={24} />, label: 'Medicines', path: '/medicines' },
    { icon: <User size={24} />, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      {navItems.map((item, index) => (
        <div 
          key={index} 
          className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.special ? 'sos-nav' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.special ? (
            <div className="sos-nav-btn">
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
    </nav>
  );
};

export default BottomNav;
