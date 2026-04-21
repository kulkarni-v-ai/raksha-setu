import React, { createContext, useContext, useState, useEffect } from 'react';

const ResponderContext = createContext();

export const useResponder = () => useContext(ResponderContext);

export const ResponderProvider = ({ children }) => {
  // Master list of available responders (persistent via localStorage)
  const [responders, setResponders] = useState([
    {
      id: 'abc123def456', // Matches the mock user id from testing
      name: 'Priya Sharma',
      role: 'Field Responder',
      location: [0, 0],
      status: 'Available'
    }
  ]);

  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'SOS-9912',
      userName: 'Rahul Verma',
      userLocation: [0, 0],
      address: 'Nehru Place Metro Station, New Delhi',
      phone: '+91 9876543210',
      type: 'Cardiac Arrest',
      severity: 'Critical',
      time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      status: 'Pending',
      assignedResponderId: null
    },
    {
      id: 'SOS-8834',
      userName: 'Anita Sharma',
      userLocation: [0, 0],
      address: 'Saket City Mall, Ground Floor',
      phone: '+91 9876543211',
      type: 'Severe Trauma - Accident',
      severity: 'High',
      time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      status: 'Accepted',
      assignedResponderId: 'abc123def456'
    },
    {
      id: 'SOS-7721',
      userName: 'Vikram Singh',
      userLocation: [0, 0],
      address: 'Hauz Khas Village',
      phone: '+91 9876543212',
      type: 'Fire Burns',
      severity: 'Medium',
      time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      status: 'Picked Up',
      assignedResponderId: 'abc123def456'
    }
  ]);

  const [taskHistory, setTaskHistory] = useState(() => {
    const saved = localStorage.getItem('responder_history');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      {
        id: 'SOS-6610',
        userName: 'Meera Rao',
        type: 'Asthma Attack',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        responseTime: '6 mins'
      }
    ];
  });
  const [availability, setAvailability] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [dutyStatus, setDutyStatus] = useState(true); // true = On Duty

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 10000); // 10s sync
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('responder_history', JSON.stringify(taskHistory));
  }, [taskHistory]);

  const syncData = async () => {
    if (!navigator.onLine) return; // Don't try to sync while offline
    try {
      const [alertsRes, respRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/sos'),
        fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')) + '/api/admin/responders')
      ]);
      const [alerts, resp] = await Promise.all([
        alertsRes.ok ? alertsRes.json() : [],
        respRes.ok ? respRes.json() : []
      ]);
      
      // Map backend alert with safety
      const mappedAlerts = Array.isArray(alerts) ? alerts.map(a => ({
        id: a._id,
        userName: a.userId?.name || 'User',
        userLocation: a.location?.coordinates ? [a.location.coordinates[1], a.location.coordinates[0]] : [0, 0],
        address: a.address || 'Medical Emergency Location',
        phone: a.userId?.phone || 'N/A',
        type: a.address || 'Medical Emergency',
        severity: a.severity || 'Medium',
        time: a.createdAt,
        status: a.status === 'active' ? 'Pending' : 
                a.status === 'deployed' ? 'Deployed' :
                a.status === 'en_route' ? 'En Route' :
                a.status === 'on_scene' ? 'On Scene' :
                a.status === 'patient_onboard' ? 'Patient Onboard' :
                a.status === 'handover' ? 'Clinical Handover' :
                a.status === 'resolved' ? 'Resolved' : 'Deployed',
        assignedResponderId: a.responderId
      })) : [];

      // Map backend responder with safety
      const mappedResp = Array.isArray(resp) ? resp.map(r => {
        // Map backend enums to UI Friendly names
        const statusMap = {
          'available': 'Available',
          'deployed': 'Deployed',
          'en_route': 'En Route',
          'on_scene': 'On Scene',
          'patient_onboard': 'Patient Onboard',
          'handover': 'Clinical Handover',
          'resolved': 'Available'
        };
        return {
          id: r._id,
          name: r.name,
          role: 'Field Responder',
          location: [0, 0], 
          status: statusMap[r.status] || r.status || 'Available'
        };
      }) : [];

      if (mappedAlerts.length > 0) setActiveAlerts(mappedAlerts);
      if (mappedResp.length > 0) setResponders(mappedResp);
    } catch (err) {
      console.error('Responder Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hospitals are now fetched dynamically via GPS + Overpass API
  const mockHospitals = [];

  // Handle incoming SOS (Simulated polling or socket)
  const receiveNewSOS = (alertData) => {
    setActiveAlerts((prev) => [alertData, ...prev]);
  };

  // Control Center: Accept the SOS (Mocking state update for UI responsiveness)
  const acceptAlert = async (alertId) => {
    setActiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Accepted' } : a));
  };

  // Control Center: Dispatch a responder
  const dispatchResponder = async (alertId, responderId) => {
    try {
      if (navigator.onLine) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/sos/${alertId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responderId })
        });
        if (res.ok) syncData();
      }
      // If the assigned responder is "me", auto-set to not available
      setAvailability(false);
    } catch (err) {
      console.error(err);
    }
  };

  const [sessionStartTime] = useState(new Date());

  // Field Responder: Update status with backend persistence
  const updateResponderStatus = async (responderId, alertId, newStatus) => {
    // 1. Mapping UI terms to Backend Status Enums
    const statusMap = {
      'Deployed': 'deployed',
      'En Route': 'en_route',
      'On Scene': 'on_scene',
      'Patient Onboard': 'patient_onboard',
      'Clinical Handover': 'handover',
      'Mission Resolved': 'resolved',
      'Completed': 'resolved'
    };
    const backendStatus = statusMap[newStatus] || newStatus.toLowerCase();

    // 2. Real-time API Sync
    if (navigator.onLine && alertId) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/sos/${alertId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: backendStatus })
        });
      } catch (err) {
        console.error('Failed to sync status to server:', err);
      }
    }

    // 3. Update Local State for speed
    setResponders(prev => prev.map(r => r.id === responderId ? { ...r, status: newStatus } : r));
    
    // Auto-Set Availability based on status
    if (['En Route', 'On Scene', 'Patient Onboard', 'Clinical Handover'].includes(newStatus)) {
      setAvailability(false);
    }

    // Track transition to history if completed
    if (newStatus === 'Mission Resolved' || newStatus === 'Completed') {
      const finishedTask = activeAlerts.find(a => a.id === alertId);
      if (finishedTask) {
        setTaskHistory(prev => [{
          ...finishedTask,
          completedAt: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 5 + 5) + ' mins' 
        }, ...prev]);
      }
      
      setAvailability(true);

      setTimeout(() => {
        setResponders(prev => prev.map(r => r.id === responderId ? { ...r, status: 'Available' } : r));
      }, 3000);
    }
  };

  // Field Responder: Submit Handover Log
  const submitHandoverLog = (alertId, note) => {
    console.log(`Handover log for alert ${alertId}:`, note);
    // In a real app, POST to backend
  };

  // Field Responder: Signal for backup
  const signalBackup = (alertId) => {
    console.log(`Backup requested for alert ${alertId}`);
    // In a real app, this would notify dispatch center
    if (navigator.onLine) {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/sos/${alertId}/backup`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {}); // Silently fail - it's a best-effort signal
    }
  };

  // Field Responder: Cancel Task
  const cancelTask = (alertId) => {
    // In real app, notify backend. Here, we just reset state.
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    setAvailability(true);
  };

  const getPerformanceStats = () => {
    const sessionHours = Math.abs(new Date() - sessionStartTime) / 36e5;
    return {
      total: taskHistory.length,
      avgResponse: taskHistory.length > 0 ? '7.4m' : '0m',
      activeHours: (sessionHours + taskHistory.length * 0.5).toFixed(1) + 'h'
    };
  };

  // Field Responder: Auto-move logic hook (Simulated movement toward destination)
  const moveResponder = (responderId, targetLocation) => {
    setResponders(prev => prev.map(r => {
      if (r.id === responderId) {
        // Very basic coordinate step interpolation
        const current = r.location;
        const latStep = (targetLocation[0] - current[0]) * 0.05; // Move smoother
        const lngStep = (targetLocation[1] - current[1]) * 0.05;
        return { ...r, location: [current[0] + latStep, current[1] + lngStep] };
      }
      return r;
    }));
  };

  const getUnreadAlertCount = () => activeAlerts.filter(a => a.status === 'Pending').length;
  const getAlertById = (id) => activeAlerts.find(a => a.id === id);
  const getResponderById = (id) => responders.find(r => r.id === id);

  return (
    <ResponderContext.Provider value={{
      responders,
      activeAlerts,
      taskHistory,
      availability,
      setAvailability,
      dutyStatus,
      setDutyStatus,
      isOnline,
      loading,
      sessionStartTime,
      getPerformanceStats,
      mockHospitals,
      receiveNewSOS,
      acceptAlert,
      dispatchResponder,
      updateResponderStatus,
      submitHandoverLog,
      signalBackup,
      cancelTask,
      moveResponder,
      getUnreadAlertCount,
      getAlertById,
      getResponderById
    }}>
      {children}
    </ResponderContext.Provider>
  );
};
