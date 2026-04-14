import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Hospitals from './pages/Hospitals';
import Medicines from './pages/Medicines';
import AICenter from './pages/AICenter';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import AccidentDetector from './components/AccidentDetector';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import HospitalManagement from './pages/admin/HospitalManagement';
import SOSMonitoring from './pages/admin/SOSMonitoring';
import PharmacyManagement from './pages/admin/PharmacyManagement';
import Analytics from './pages/admin/Analytics';
import PharmacyLayout from './pages/pharmacy/PharmacyLayout';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import MedicineManager from './pages/pharmacy/MedicineManager';
import PharmacyProfile from './pages/pharmacy/PharmacyProfile';
import DemandAnalytics from './pages/pharmacy/DemandAnalytics';
import OrderManager from './pages/pharmacy/OrderManager';
import { PharmacyProvider } from './context/PharmacyContext';
import UserLayout from './pages/UserLayout';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Wrapper component for the app content
const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isPharmacy = location.pathname.startsWith('/pharmacy');
  const showBottomNav = location.pathname !== '/login' && !isAdmin && !isPharmacy;

  return (
    <div className="app-main">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Main Dashboard - No Sidebar */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Secondary Pages - With Sidebar on Desktop */}
        <Route element={<UserLayout />}>
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/ai" element={<AICenter />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="hospitals" element={<HospitalManagement />} />
          <Route path="pharmacies" element={<PharmacyManagement />} />
          <Route path="sos" element={<SOSMonitoring />} />
          <Route path="analytics" element={<Analytics />} />
          <Route index element={<Navigate to="overview" replace />} />
        </Route>

        {/* --- PHARMACY ROUTES --- */}
        <Route path="/pharmacy" element={
          <PharmacyProvider>
             <PharmacyLayout />
          </PharmacyProvider>
        }>
          <Route path="dashboard" element={<PharmacyDashboard />} />
          <Route path="medicines" element={<MedicineManager />} />
          <Route path="profile" element={<PharmacyProfile />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="analytics" element={<DemandAnalytics />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="/sos" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Show Bottom Nav and Accident Detector for all user-facing pages on mobile */}
      {showBottomNav && <AccidentDetector />}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;

