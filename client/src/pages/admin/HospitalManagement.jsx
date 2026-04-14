import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, MapPin, Phone, Edit3, Trash2, 
  Plus, Search, Hospital, Globe, Info 
} from 'lucide-react';

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([
    { id: 1, name: 'AIIMS Delhi', location: 'Ansari Nagar, New Delhi', lat: 28.5672, lng: 77.2100, contact: '011-26588500', type: 'Govt / Tertiary' },
    { id: 2, name: 'Max Super Specialty', location: 'Saket, New Delhi', lat: 28.5244, lng: 77.2100, contact: '011-26515050', type: 'Private / Specialty' },
    { id: 3, name: 'Fortis Escorts', location: 'Okhla Road, New Delhi', lat: 28.5606, lng: 77.2612, contact: '011-47135000', type: 'Private / Heart' },
    { id: 4, name: 'St. Stephens Hospital', location: 'Tis Hazari, Delhi', lat: 28.6677, lng: 77.2212, contact: '011-23966021', type: 'Charitable' },
  ]);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // @ts-ignore
      mapInstance.current = L.map(mapRef.current).setView([28.6139, 77.2090], 11);
      // @ts-ignore
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap'
      }).addTo(mapInstance.current);

      hospitals.forEach(h => {
        // @ts-ignore
        L.marker([h.lat, h.lng]).addTo(mapInstance.current)
          .bindPopup(`<b>${h.name}</b><br>${h.type}`);
      });
    }
  }, [hospitals]);

  return (
    <div className="hospital-management animate-slide-up">
      <div className="module-header">
        <div>
          <h1>Hospital Network</h1>
          <p>Manage secondary and tertiary care hospital partners.</p>
        </div>
        <button className="admin-primary-btn">
          <Plus size={18} /> Add New Hospital
        </button>
      </div>

      <div className="admin-grid-layout">
        <div className="admin-card list-column">
          <div className="card-top">
            <div className="search-wrap">
              <Search size={16} />
              <input type="text" placeholder="Search hospitals..." />
            </div>
          </div>

          <div className="hospital-scroll-list">
            {hospitals.map((h) => (
              <div key={h.id} className="hospital-admin-item">
                <div className="h-icon-box">
                  <Hospital size={20} />
                </div>
                <div className="h-details">
                  <h4>{h.name}</h4>
                  <span className="h-type">{h.type}</span>
                  <div className="h-meta">
                    <MapPin size={12} /> {h.location}
                  </div>
                  <div className="h-meta">
                    <Phone size={12} /> {h.contact}
                  </div>
                </div>
                <div className="h-actions">
                  <button className="icon-btn-tiny"><Edit3 size={16} /></button>
                  <button className="icon-btn-tiny red"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-column">
          <div className="admin-card map-card">
            <div className="card-head">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h3 style={{ margin: 0 }}>Geospatial Overview</h3>
                <div className="map-legend">
                  <span className="dot govt"></span> Govt
                  <span className="dot pvt"></span> Private
                </div>
              </div>
            </div>
            <div className="admin-map-container" ref={mapRef}></div>
            <div className="map-stats">
               <div className="ms-item">
                  <div className="p-stat-icon blue" style={{ width: '36px', height: '36px' }}><Globe size={18} /></div>
                  <div>
                    <label>Coverage Area</label>
                    <span>Delhi NCR (24km rad)</span>
                  </div>
               </div>
               <div className="ms-item">
                  <div className="p-stat-icon orange" style={{ width: '36px', height: '36px' }}><Info size={18} /></div>
                  <div>
                    <label>Critical Hubs</label>
                    <span>12 Intensive Care Units</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-grid-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 200px);
        }

        .list-column {
          display: flex;
          flex-direction: column;
          padding: 0 !important;
          overflow: hidden;
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
        }

        .card-top {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }

        .hospital-scroll-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .hospital-admin-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
          position: relative;
          color: var(--text-main);
        }

        .hospital-admin-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .h-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
        }

        .h-details {
          flex: 1;
        }

        .h-details h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 0.2rem 0;
          color: var(--text-main);
        }

        .h-type {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          display: block;
          margin-bottom: 0.4rem;
        }

        .h-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.2rem;
        }

        .h-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .hospital-admin-item:hover .h-actions {
          opacity: 1;
        }

        .icon-btn-tiny {
          width: 28px;
          height: 28px;
          border-radius: 0.4rem;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn-tiny.red:hover { border-color: var(--emergency); color: var(--emergency); }

        /* Map Column */
        .map-column {
          display: flex;
          flex-direction: column;
        }

        .map-card {
           height: 100%;
           display: flex;
           flex-direction: column;
           padding: 0 !important;
           background: var(--glass-bg);
           backdrop-filter: blur(16px);
           border: 1px solid var(--glass-border);
           border-radius: 1rem;
           overflow: hidden;
        }

        .map-card .card-head {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .admin-map-container {
          flex: 1;
          background: var(--input-bg);
        }

        .map-legend {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.govt { background: var(--primary); }
        .dot.pvt { background: var(--emergency); }

        .map-stats {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 2rem;
        }

        .ms-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-main);
        }

        .ms-item label {
          display: block;
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .ms-item span {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
        }

        @media (max-width: 1100px) {
          .admin-grid-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .admin-map-container {
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default HospitalManagement;
