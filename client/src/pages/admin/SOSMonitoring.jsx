import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, MapPin, Clock, CheckCircle, 
  ChevronRight, AlertTriangle, Phone, MoreHorizontal,
  Navigation, Eye
} from 'lucide-react';

const SOSMonitoring = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, user: 'Amit Sharma', location: 'Saket, Block B, New Delhi', lat: 28.5244, lng: 77.2100, time: '2 mins ago', status: 'Active', severity: 'Critical', phone: '+91 98765 43210' },
    { id: 2, user: 'Priya Verma', location: 'Hauz Khas Village', lat: 28.5521, lng: 77.1948, time: '8 mins ago', status: 'Active', severity: 'High', phone: '+91 99887 76655' },
    { id: 3, user: 'Rahul Singh', location: 'Malviya Nagar Market', lat: 28.5362, lng: 77.2100, time: '24 mins ago', status: 'Resolved', severity: 'Moderate', phone: '+91 88776 65544' },
    { id: 4, user: 'Sneha Gupta', location: 'Greater Kailash 1', lat: 28.5482, lng: 77.2345, time: '1 hour ago', status: 'Resolved', severity: 'Critical', phone: '+91 77665 54433' },
  ]);

  const [selectedAlert, setSelectedAlert] = useState(alerts[0]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // @ts-ignore
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([28.53, 77.21], 13);
      // @ts-ignore
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    }

    // Refresh Markers
    alerts.forEach(alert => {
      if (!markersRef.current[alert.id]) {
        const color = alert.status === 'Active' ? '#ef4444' : '#10b981';
        // @ts-ignore
        const marker = L.circleMarker([alert.lat, alert.lng], {
          radius: 12,
          fillColor: color,
          color: '#fff',
          weight: 3,
          fillOpacity: 0.9,
          className: 'sos-map-marker'
        }).addTo(mapInstance.current);
        
        marker.on('click', () => {
          focusAlert(alert);
        });

        markersRef.current[alert.id] = marker;
      }
    });
  }, [alerts]);

  const focusAlert = (alert) => {
    setSelectedAlert(alert);
    if (mapInstance.current) {
      mapInstance.current.flyTo([alert.lat, alert.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      // Small delay to ensure marker exists if just added
      setTimeout(() => {
        if (markersRef.current[alert.id]) {
            markersRef.current[alert.id].bringToFront();
        }
      }, 100);
    }
  };

  const resolveAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    if (markersRef.current[id]) {
       markersRef.current[id].setStyle({ fillColor: '#10b981' });
    }
  };

  return (
    <div className="sos-monitoring animate-slide-up">
      <div className="module-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <div className="p-stat-icon orange" style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <ShieldAlert color="#ef4444" size={24} />
            </div>
            Live SOS Monitor
          </h1>
          <p>Real-time emergency tracking and responder dispatch control.</p>
        </div>
        <div className="header-status-pills">
           <span className="live-pulse"></span>
           <span className="txt">System Live: 14 Active Alerts</span>
        </div>
      </div>

      <div className="sos-grid">
        {/* Left: Active Feed */}
        <div className="sos-feed-column">
          <div className="feed-tabs">
            <button className="feed-tab active">Active ({alerts.filter(a => a.status === 'Active').length})</button>
            <button className="feed-tab">History</button>
          </div>
          <div className="alerts-scroll-area">
            {alerts.filter(a => a.status === 'Active').map((alert) => (
              <div 
                key={alert.id} 
                className={`sos-alert-card glassmorphism ${selectedAlert?.id === alert.id ? 'active' : ''}`}
                onClick={() => focusAlert(alert)}
              >
                 <div className="alert-badge-top" style={{ background: alert.severity === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)', color: alert.severity === 'Critical' ? '#ef4444' : '#f97316', border: '1px solid currentColor' }}>
                   {alert.severity}
                 </div>
                 <div className="card-row">
                    <div className="p-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{alert.user.charAt(0)}</div>
                    <div className="card-main">
                      <h4 className="user-name" style={{ marginBottom: '0.15rem' }}>{alert.user}</h4>
                      <div className="meta-item"><Clock size={12} /> {alert.time}</div>
                      <div className="meta-item"><MapPin size={12} /> {alert.location}</div>
                    </div>
                    <ChevronRight size={18} className="arrow-icon" style={{ opacity: selectedAlert?.id === alert.id ? 1 : 0.3 }} />
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Detailed Map View */}
        <div className="sos-map-column">
          <div className="admin-card map-card-full" style={{ position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }}></div>
            
            {/* Map Overlay for Details - Floating Intel Card */}
            {selectedAlert && (
              <div className="map-detail-overlay animate-slide-up" style={{ zIndex: 1000 }}>
                <div className="overlay-header">
                  <div className="oh-info">
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedAlert.user}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <span className="status-pill active" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{selectedAlert.severity}</span>
                        <span className="status-pill" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem' }}>{selectedAlert.status} Case</span>
                    </div>
                  </div>
                  <button className="icon-btn-tiny" onClick={() => setSelectedAlert(null)}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="overlay-body">
                  <div className="data-bit">
                    <label>Reported Location</label>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} color="var(--primary)" /> {selectedAlert.location}</p>
                  </div>
                  <div className="data-bit">
                    <label>Assigned Responder</label>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Navigation size={14} color="var(--success)" /> Delta Team 4 (2.1km away)</p>
                  </div>
                  <div className="dispatch-actions">
                    <button className="admin-primary-btn phone" style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--primary)', color: 'var(--primary)', boxShadow: 'none' }}>
                      <Phone size={16} /> Contact User
                    </button>
                    <button className="admin-primary-btn resolve" style={{ flex: 1 }} onClick={() => resolveAlert(selectedAlert.id)}>
                      <CheckCircle size={16} /> Resolve Alert
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sos-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 180px);
        }

        .sos-feed-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .header-status-pills {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          border: 1px solid var(--border-color);
        }

        .live-pulse {
          width: 8px;
          height: 8px;
          background: var(--emergency);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }

        .header-status-pills .txt {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--emergency);
        }

        .feed-tabs {
          display: flex;
          background: var(--input-bg);
          padding: 0.3rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
        }

        .feed-tab {
          flex: 1;
          padding: 0.5rem;
          border: none;
          background: none;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .feed-tab.active {
          background: var(--card-bg);
          color: var(--text-main);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--card-border);
        }

        .alerts-scroll-area {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-right: 0.5rem;
        }

        .sos-alert-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
          padding: 1.25rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          color: var(--text-main);
        }

        .sos-alert-card:hover {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .sos-alert-card.active {
          border-color: var(--emergency);
          background: rgba(239, 68, 68, 0.05);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        .alert-badge-top {
          position: absolute;
          top: 0.75rem;
          right: 1rem;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: 2rem;
          text-transform: uppercase;
        }

        .card-row {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 1rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
          color: var(--text-main);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.15rem;
        }

        .arrow-icon {
          color: var(--border-color);
        }

        /* Map Column & Overlay */
        .sos-map-column {
          position: relative;
          height: 100%;
        }

        .map-card-full {
          width: 100%;
          height: 100%;
          padding: 0 !important;
          overflow: hidden;
          position: relative;
          border-radius: 1rem;
          border: 1px solid var(--glass-border);
          background: var(--input-bg);
        }

        .map-detail-overlay {
          position: absolute;
          bottom: 2rem;
          left: 0;
          right: 0;
          margin-left: auto;
          margin-right: auto;
          width: 90%;
          max-width: 460px;
          background: var(--glass-bg);
          backdrop-filter: blur(28px);
          border-radius: 1.25rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          z-index: 1000;
          padding: 1.1rem;
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .overlay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .oh-info h3 {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .overlay-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .data-bit label {
          font-size: 0.6rem;
          text-transform: uppercase;
          font-weight: 800;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.15rem;
          letter-spacing: 0.05em;
        }

        .data-bit p {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
        }

        .dispatch-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
          width: 100%;
        }
        
        .dispatch-actions button {
            flex: 1;
            padding: 0.6rem;
            font-size: 0.8rem;
        }

        @media (max-width: 1024px) {
          .sos-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .sos-map-column {
            height: 520px;
          }
          .map-detail-overlay {
             width: 85%;
          }
        }

        /* Essential Mobile Fixes */
        @media (max-width: 600px) {
          .map-detail-overlay {
             bottom: 5.5rem; /* Stay above Admin Bottom Nav */
             width: 92%;
             padding: 0.9rem;
          }
          .dispatch-actions {
            flex-direction: column;
          }
          .dispatch-actions button {
             width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SOSMonitoring;
