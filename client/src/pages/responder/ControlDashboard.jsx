import React, { useState, useEffect, useRef } from 'react';
import { useResponder } from '../../context/ResponderContext';
import { 
  AlertCircle, MapPin, Activity, CheckCircle, Navigation, Phone, 
  User, Clock, ShieldAlert, Wifi, PlusCircle, Maximize2, Radio 
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const ControlDashboard = () => {
  const { activeAlerts, responders, mockHospitals, acceptAlert } = useResponder();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [feedTab, setFeedTab] = useState('Active');
  const navigate = useNavigate();
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Time Tracker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Map Initialization & Updates
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      if (!window.L) return;
      mapInstance.current = window.L.map(mapRef.current, { zoomControl: false }).setView([0, 0], 13);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    }
    
    if (mapInstance.current && window.L) {
       mapInstance.current.eachLayer(layer => {
         if (layer instanceof window.L.CircleMarker || layer instanceof window.L.Marker) {
           mapInstance.current.removeLayer(layer);
         }
       });

       // Draw Hospitals
       mockHospitals?.forEach(h => {
         window.L.circleMarker(h.location, { radius: 10, fillColor: '#3b82f6', color: '#fff', weight: 2, fillOpacity: 0.8 }).addTo(mapInstance.current).bindPopup(`<b>${h.name}</b><br>Hospital Facility`);
       });

       // Draw Alerts
       activeAlerts.forEach(a => {
         if (a.status !== 'Resolved') {
           const color = a.severity === 'High' ? '#ef4444' : a.severity === 'Medium' ? '#f59e0b' : '#10b981';
           window.L.circleMarker(a.userLocation, { radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9 })
             .addTo(mapInstance.current)
             .bindPopup(`<b>${a.userName}</b><br>${a.type}<br>Status: ${a.status}`);
         }
       });

       // Draw Responders
       responders.forEach(r => {
         const color = r.status === 'Available' ? '#10b981' : (r.status === 'Assigned' || r.status === 'On the way') ? '#f59e0b' : '#64748b';
         window.L.circleMarker(r.location, { radius: 6, fillColor: color, color: '#fff', weight: 2, fillOpacity: 1 })
           .addTo(mapInstance.current)
           .bindPopup(`<b>${r.name}</b><br>${r.role} • ${r.status}`);
       });
    }
  }, [activeAlerts, responders, mockHospitals]);

  const stats = {
    activeEmergencies: activeAlerts.filter(a => a.status === 'Pending' || a.status === 'Accepted').length,
    unitsResponding: activeAlerts.filter(a => a.status === 'Dispatched').length,
    availableUnits: responders.filter(r => r.status === 'Available').length
  };

  const displayedAlerts = activeAlerts.filter(a => feedTab === 'Active' ? a.status !== 'Resolved' : a.status === 'Resolved');

  const threatLevel = stats.activeEmergencies > 3 ? 'Critical' : stats.activeEmergencies > 0 ? 'Moderate' : 'Normal';
  const threatColor = threatLevel === 'Critical' ? '#ef4444' : threatLevel === 'Moderate' ? '#f59e0b' : '#10b981';

  const handleAssignClick = (alert) => {
    if (alert.status === 'Pending') {
      acceptAlert(alert.id);
    }
    navigate(`/responder/decision/${alert.id}`);
  };

  const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return 0;
    const dx = loc1[0] - loc2[0];
    const dy = loc1[1] - loc2[1];
    return (Math.sqrt(dx*dx + dy*dy) * 111).toFixed(1);
  };

  const getSeverityBadge = (severity) => {
    const bg = severity === 'High' ? 'rgba(239, 68, 68, 0.1)' : severity === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
    const color = severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#10b981';
    return <span style={{ background: bg, color, padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 800 }}>{severity} PRIORITY</span>;
  };

  return (
    <div className="dashboard-container">
      
      {/* COMMAND HEADER */}
      <div className="glassmorphism animate-slide-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: '1.5rem', borderRadius: '1.25rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-main)', padding: '0.6rem', borderRadius: '50%', color: 'var(--primary)' }}><Radio size={20} /></div>
            <div>
               <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Central Command Hub</h2>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> Officer: Control Desk 1</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {currentTime.toLocaleTimeString()}</span>
               </div>
            </div>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '1rem' }}>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Status</span>
               <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Wifi size={14} /> Operational
               </span>
            </div>
            <div style={{ padding: '0.5rem 1rem', background: `rgba(${threatLevel === 'Critical' ? '239, 68, 68' : threatLevel === 'Moderate' ? '245, 158, 11' : '16, 185, 129'}, 0.1)`, borderRadius: '1rem', border: `1px solid ${threatColor}` }}>
               <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Threat Level</span>
               <strong style={{ color: threatColor, fontSize: '1rem' }}>{threatLevel}</strong>
            </div>
         </div>
      </div>

      <div className="dashboard-main-grid">
        
        {/* LEFT COLUMN: Map & Active Alerts */}
        <div className="main-content-flow" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="glassmorphism" style={{ flex: '1 1 200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '50%', color: '#ef4444' }}><AlertCircle /></div>
               <div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.activeEmergencies}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Pending Alerts</span>
                  <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>+1 since last hour</span>
               </div>
            </div>
            <div className="glassmorphism" style={{ flex: '1 1 200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '50%', color: '#10b981' }}><CheckCircle /></div>
               <div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.availableUnits}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Available Units</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Optimal Coverage</span>
               </div>
            </div>
            <div className="glassmorphism" style={{ flex: '1 1 200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.8rem', borderRadius: '50%', color: '#f59e0b' }}><Activity /></div>
               <div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.unitsResponding}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Active Dispatches</span>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>Live Tracking Enabled</span>
               </div>
            </div>
          </div>

          {/* MAP */}
          <div className="glassmorphism" style={{ padding: '0.5rem', overflow: 'hidden', height: '400px', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Live Radar View</h3>
               <button className="icon-btn"><Maximize2 size={16} /></button>
            </div>
            <div ref={mapRef} style={{ width: '100%', flex: 1, borderRadius: '1rem' }}></div>
          </div>
          
          {/* QUICK ACTIONS */}
          <div className="glassmorphism" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
             <button className="primary-btn" style={{ flex: 1, padding: '0.8rem' }}><PlusCircle size={18} /> Call Ambulance</button>
             <button className="secondary-btn" style={{ flex: 1, padding: '0.8rem' }}><ShieldAlert size={18} /> Broadcast Alert</button>
          </div>
        </div>

        {/* RIGHT COLUMN: Feed */}
        <aside className="emergency-sidebar">
          <div className="modern-card" style={{ padding: '1.25rem', height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--bg-soft)', padding: '0.4rem', borderRadius: '1rem' }}>
               <button 
                 onClick={() => setFeedTab('Active')}
                 style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', background: feedTab === 'Active' ? 'var(--card-bg)' : 'transparent', color: feedTab === 'Active' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: feedTab === 'Active' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>
                 Live Feed
               </button>
               <button 
                 onClick={() => setFeedTab('History')}
                 style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', background: feedTab === 'History' ? 'var(--card-bg)' : 'transparent', color: feedTab === 'History' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: feedTab === 'History' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>
                 History Log
               </button>
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
               {feedTab === 'Active' ? 'Active Emergencies' : 'Archived Responses'}
               <span style={{ fontSize: '0.8rem', background: 'var(--bg-main)', padding: '0.3rem 0.8rem', borderRadius: '2rem' }}>{displayedAlerts.length} Total</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayedAlerts.map(alert => (
              <div key={alert.id} className="modern-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${alert.severity === 'High' ? '#ef4444' : alert.severity === 'Medium' ? '#f59e0b' : '#10b981'}`, opacity: alert.status === 'Resolved' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  {getSeverityBadge(alert.severity || 'Medium')}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.1rem' }}>{alert.userName}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                     <MapPin size={14} /> Coordinates: {alert.userLocation[0].toFixed(3)}, {alert.userLocation[1].toFixed(3)}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', background: 'var(--bg-soft)', padding: '0.5rem', borderRadius: '0.5rem' }}><strong>Context:</strong> {alert.type}</p>
                
                {/* Visual Tracker */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                   {['Pending', 'Accepted', 'Dispatched', 'Resolved'].map((step, i) => {
                      const stages = ['Pending', 'Accepted', 'Dispatched', 'Resolved'];
                      const currentIdx = stages.indexOf(alert.status);
                      const isActive = i <= currentIdx;
                      return (
                         <div key={step} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--card-bg)', border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}` }}></div>
                            <span style={{ color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>{step}</span>
                         </div>
                      );
                   })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {alert.status === 'Pending' || alert.status === 'Accepted' ? (
                     <button className="primary-btn" style={{ flex: 2, padding: '0.6rem' }} onClick={() => handleAssignClick(alert)}>
                       <Navigation size={16} /> Assign
                     </button>
                   ) : alert.status === 'Resolved' ? (
                     <div style={{ flex: 2, padding: '0.6rem', background: 'var(--bg-soft)', borderRadius: '0.5rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                        Mission Completed
                     </div>
                   ) : (
                     <div style={{ flex: 2, padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', color: '#10b981', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                       Unit {responders.find(r => r.id === alert.assignedResponderId)?.name || 'Unknown'} En Route
                     </div>
                   )}
                   <a href={`tel:${alert.phone}`} className="secondary-btn" style={{ flex: 1, padding: '0.6rem' }} title="Call User">
                     <Phone size={16} />
                   </a>
                </div>
              </div>
            ))}
            </div>
            
            {displayedAlerts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
                <CheckCircle size={40} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                <h4>{feedTab === 'Active' ? 'All Clear' : 'No History'}</h4>
                <p>{feedTab === 'Active' ? 'No active emergencies in your sector.' : 'Archived events will appear here.'}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ControlDashboard;
