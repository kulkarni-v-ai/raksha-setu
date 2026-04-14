import React, { createContext, useContext, useState, useEffect } from 'react';

const PharmacyContext = createContext();

export const usePharmacy = () => useContext(PharmacyContext);

export const PharmacyProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Initial Simulated Live Requests
  const INITIAL_REQUESTS = [
    {
      id: 'REQ-01',
      hospital: 'City Care Hospital',
      distance: '1.2 km',
      medication: 'Remdesivir 100mg',
      quantity: 5,
      urgency: 'critical',
      time: '2 mins ago',
      status: 'pending'
    },
    {
      id: 'REQ-02',
      hospital: 'Red Cross Clinic',
      distance: '3.4 km',
      medication: 'Amoxicillin 500mg',
      quantity: 20,
      urgency: 'high',
      time: '15 mins ago',
      status: 'pending'
    },
    {
      id: 'REQ-03',
      hospital: 'Apollo Life Center',
      distance: '0.8 km',
      medication: 'Dolo 650mg',
      quantity: 50,
      urgency: 'medium',
      time: '1 hour ago',
      status: 'pending'
    }
  ];

  useEffect(() => {
    // Simulate initial fetch
    const timer = setTimeout(() => {
      setRequests(INITIAL_REQUESTS);
      // Pre-load an initial notification to show it works
      addNotification('New emergency requests need your attention.', 'system');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const addNotification = (message, type = 'info') => {
    const freshNotification = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [freshNotification, ...prev]);
    setUnreadNotifs(prev => prev + 1);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotifs(0);
  };

  const updateRequestStatus = (id, newStatus, qty, medName) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

    if (newStatus === 'accepted') {
      addNotification(`Dispatched ${qty}x ${medName} successfully.`, 'success');
    } else if (newStatus === 'rejected') {
      addNotification(`Declined request for ${medName}.`, 'warning');
    }
  };

  return (
    <PharmacyContext.Provider value={{ 
      requests, 
      notifications, 
      unreadNotifs,
      addNotification,
      markAllNotificationsRead,
      updateRequestStatus
    }}>
      {children}
    </PharmacyContext.Provider>
  );
};
