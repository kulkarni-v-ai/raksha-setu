import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import UserSideNav from '../components/UserSideNav';
import { useTheme } from '../context/ThemeContext';

const UserLayout = () => {
  const { isDark } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Simple auth check - use 'token' as defined in Login.jsx
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('admin-token');
  
  if (!token && !adminToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`user-root-layout has-user-sidebar ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <UserSideNav isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="user-main-content">
        <div className="user-content-viewport">
          <Outlet />
        </div>
      </main>

      <style>{`
        .user-root-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-main);
          background-image: var(--bg-image);
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
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
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .user-content-viewport {
            padding: 2.5rem;
          }
        }

        @media (max-width: 1024px) {
          .user-main-content {
             padding-bottom: 70px; /* Space for BottomNav on mobile */
          }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;
