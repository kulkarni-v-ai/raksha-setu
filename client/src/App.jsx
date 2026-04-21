import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Hospitals from './pages/Hospitals';
import Medicines from './pages/Medicines';
import AICenter from './pages/AICenter';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
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
import { ResponderProvider } from './context/ResponderContext';
import ResponderLayout from './pages/responder/ResponderLayout';
import ControlDashboard from './pages/responder/ControlDashboard';
import DecisionCenter from './pages/responder/DecisionCenter';
import LiveTracking from './pages/responder/LiveTracking';
import MissionHistory from './pages/responder/MissionHistory';
import PerformanceSummary from './pages/responder/PerformanceSummary';
import ResponderManagement from './pages/responder/ResponderManagement';
import FieldDashboard from './pages/responder/FieldDashboard';
import UserLayout from './pages/UserLayout';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Wrapper component for the app content
const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isPharmacy = location.pathname.startsWith('/pharmacy');
  
  // Field responders use a dedicated suite with its own navigation.
  const isResponderSuite = location.pathname.startsWith('/responder');
  const showBottomNav = location.pathname !== '/login' && !isAdmin && !isPharmacy && !isResponderSuite;

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

        {/* --- RESPONDER SYSTEM ROUTES --- */}
        <Route path="/responder" element={
          <ResponderProvider>
             <ResponderLayout />
          </ResponderProvider>
        }>
           <Route path="control" element={<ControlDashboard />} />
           <Route path="decision/:id" element={<DecisionCenter />} />
           <Route path="tracking/:id" element={<LiveTracking />} />
           <Route path="management" element={<ResponderManagement />} />
           <Route path="field" element={<FieldDashboard />} />
           <Route path="history" element={<MissionHistory />} />
           <Route path="performance" element={<PerformanceSummary />} />
           <Route index element={<Navigate to="control" replace />} />
        </Route>

        <Route path="/sos" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Show Bottom Nav for all user-facing pages on mobile */}
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

